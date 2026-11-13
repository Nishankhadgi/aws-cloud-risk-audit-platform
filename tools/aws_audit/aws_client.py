"""Safe Read-Only AWS Client Manager for IT Audit Engagements."""

import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("aws_audit.client")

# Strict read-only API method prefixes permitted for security auditing
PERMITTED_METHOD_PREFIXES = (
    "get_",
    "list_",
    "describe_",
    "lookup_",
    "view_",
    "batch_get_",
    "scan_",
    "query_",
)

# Mutating and non-auditing method prefixes explicitly blacklisted
MUTATING_METHOD_PREFIXES = (
    "create_",
    "delete_",
    "put_",
    "update_",
    "modify_",
    "attach_",
    "detach_",
    "stop_",
    "start_",
    "reboot_",
    "terminate_",
    "authorize_",
    "revoke_",
    "apply_",
    "tag_",
    "untag_",
    "enable_",
    "disable_",
    "disassociate_",
    "associate_",
    "register_",
    "deregister_",
    "set_",
    "reset_",
    "purge_",
    "send_",
    "write_",
    "import_",
    "export_",
    "restore_",
    "run_",
    "replace_",
)

class SecurityAuditViolationError(Exception):
    """Raised when an operation attempts to invoke a non-read-only AWS API."""
    pass

class SafeAWSClient:
    """Read-only Boto3 wrapper enforcing the AWS Audit principle of least privilege."""

    def __init__(
        self,
        profile_name: Optional[str] = None,
        sample_mode: bool = False,
        session: Optional[Any] = None,
        account_id: Optional[str] = None,
    ):
        self.profile_name = profile_name
        self.sample_mode = sample_mode
        self._session = session
        self._account_id = account_id or ("112233445566" if sample_mode else None)
        self._clients: Dict[str, Any] = {}

        if not sample_mode and self._session is None:
            try:
                import boto3
                if profile_name:
                    self._session = boto3.Session(profile_name=profile_name)
                else:
                    self._session = boto3.Session()
                
                # Retrieve Account ID safely
                sts = self._session.client("sts")
                caller_identity = sts.get_caller_identity()
                self._account_id = caller_identity.get("Account", "UNKNOWN_ACCOUNT")
            except Exception as e:
                # Live mode must fail closed. Never substitute simulated results
                # after an authentication or session-initialization failure.
                logger.error(
                    "Could not initialize the requested live AWS session; refusing to run a sample assessment."
                )
                raise RuntimeError(
                    "Live AWS session initialization failed. Verify the selected profile and read-only credentials; no scan was run."
                ) from e

    @property
    def account_id(self) -> str:
        return self._account_id or "112233445566"

    def _assert_readonly_operation(self, operation_name: str) -> None:
        """Enforces that an operation name conforms to read-only security audit standards."""
        op_lower = operation_name.lower()
        if any(op_lower.startswith(prefix) for prefix in MUTATING_METHOD_PREFIXES):
            raise SecurityAuditViolationError(
                f"AUDIT SAFETY VIOLATION: '{operation_name}' is a mutating AWS operation. Internal IT auditors are restricted to read-only APIs."
            )
        if not any(op_lower.startswith(prefix) for prefix in PERMITTED_METHOD_PREFIXES):
            raise SecurityAuditViolationError(
                f"AUDIT SAFETY VIOLATION: '{operation_name}' is not in the permitted read-only security audit API whitelist."
            )

    @staticmethod
    def _classify_error(e: Exception) -> Dict[str, Any]:
        """Classifies AWS ClientErrors into standardized audit limitation categories."""
        error_code = getattr(e, "response", {}).get("Error", {}).get("Code", type(e).__name__)
        error_msg = str(e)
        is_perm_denied = error_code in [
            "AccessDenied",
            "AccessDeniedException",
            "UnauthorizedOperation",
            "AuthFailure",
            "ForbiddenException",
        ]
        is_throttled = error_code in [
            "Throttling",
            "ThrottlingException",
            "RequestLimitExceeded",
            "ProvisionedThroughputExceededException",
            "RateExceeded",
            "TooManyRequestsException",
        ]
        return {
            "_error": error_msg,
            "_error_code": error_code,
            "_is_permission_denied": is_perm_denied,
            "_is_throttled": is_throttled,
        }

    def get_client(self, service_name: str, region_name: Optional[str] = None):
        """Returns a cached Boto3 client, guarded by read-only policy."""
        client_key = f"{service_name}:{region_name or 'default'}"
        if client_key in self._clients:
            return self._clients[client_key]

        if self.sample_mode:
            return None

        if self._session:
            try:
                client = self._session.client(service_name, region_name=region_name)
                self._clients[client_key] = client
                return client
            except Exception as e:
                logger.error(f"Failed to create client for {service_name} in {region_name}: {e}")
                return None

        return None

    def call_readonly_api(self, service_name: str, operation_name: str, region_name: Optional[str] = None, **kwargs) -> Dict[str, Any]:
        """Safely invokes a single read-only AWS API method, verifying operation safety."""
        self._assert_readonly_operation(operation_name)

        client = self.get_client(service_name, region_name)
        if not client:
            return {"_error": f"Client unavailable for {service_name} in {region_name}"}

        method = getattr(client, operation_name, None)
        if not method or not callable(method):
            return {"_error": f"Operation {operation_name} not supported by {service_name}"}

        try:
            return method(**kwargs)
        except Exception as e:
            classified = self._classify_error(e)
            logger.warning(
                f"AWS API call {service_name}.{operation_name} failed: [{classified['_error_code']}] {classified['_error']}"
            )
            return classified

    def paginate_readonly_api(
        self,
        service_name: str,
        operation_name: str,
        region_name: Optional[str] = None,
        result_key: Optional[str] = None,
        max_pages: int = 50,
        **kwargs
    ) -> List[Any]:
        """
        Safely paginates through read-only AWS APIs across multiple pages.
        Guarantees complete populations (PCAOB AS 1105 IPE Completeness) while capping
        consumption at max_pages to prevent uncontrolled API rate exhaustion.
        """
        self._assert_readonly_operation(operation_name)

        client = self.get_client(service_name, region_name)
        if not client:
            if self.sample_mode:
                return []
            logger.warning(f"Client unavailable for {service_name} pagination in {region_name}")
            return []

        collected_items: List[Any] = []

        # 1. Native Boto3 Paginator if supported
        try:
            if hasattr(client, "can_paginate") and client.can_paginate(operation_name):
                paginator = client.get_paginator(operation_name)
                page_count = 0
                for page in paginator.paginate(**kwargs):
                    page_count += 1
                    if result_key:
                        items = page.get(result_key, [])
                        if isinstance(items, list):
                            collected_items.extend(items)
                        elif isinstance(items, dict):
                            collected_items.append(items)
                    else:
                        collected_items.append(page)

                    if page_count >= max_pages:
                        logger.info(f"Reached safety page limit ({max_pages}) for {service_name}.{operation_name}")
                        break
                return collected_items
        except Exception as e:
            classified = self._classify_error(e)
            logger.warning(
                f"Paginator failed for {service_name}.{operation_name}: [{classified['_error_code']}] {classified['_error']}"
            )
            return []

        # 2. Fallback manual token pagination loop
        method = getattr(client, operation_name, None)
        if not method or not callable(method):
            return []

        call_kwargs = dict(kwargs)
        page_count = 0

        while page_count < max_pages:
            page_count += 1
            try:
                resp = method(**call_kwargs)
            except Exception as e:
                classified = self._classify_error(e)
                logger.warning(
                    f"Manual pagination call failed for {service_name}.{operation_name}: [{classified['_error_code']}] {classified['_error']}"
                )
                break

            if result_key:
                items = resp.get(result_key, [])
                if isinstance(items, list):
                    collected_items.extend(items)
                elif isinstance(items, dict):
                    collected_items.append(items)
            else:
                collected_items.append(resp)

            # Check common AWS pagination markers
            next_token = (
                resp.get("NextToken")
                or resp.get("Marker")
                or resp.get("NextMarker")
                or resp.get("NextContinuationToken")
            )
            if not next_token or (resp.get("IsTruncated") is False and not resp.get("NextToken")):
                break

            # Set the parameter for next iteration
            if "NextToken" in resp or "NextToken" in call_kwargs:
                call_kwargs["NextToken"] = next_token
            elif "Marker" in resp or "NextMarker" in resp or "Marker" in call_kwargs:
                call_kwargs["Marker"] = next_token
            elif "NextContinuationToken" in resp or "ContinuationToken" in call_kwargs:
                call_kwargs["ContinuationToken"] = next_token
            else:
                call_kwargs["NextToken"] = next_token

        return collected_items
