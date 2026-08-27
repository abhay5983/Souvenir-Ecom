class IntegrationError(Exception):
    def __init__(self, message, *, code='INTEGRATION_ERROR', status=502, details=None):
        super().__init__(message)
        self.code = code
        self.status = status
        self.details = details


class IntegrationNotConfigured(IntegrationError):
    def __init__(self, message):
        super().__init__(message, code='NOT_CONFIGURED', status=503)
