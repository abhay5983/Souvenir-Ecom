import json
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from .exceptions import IntegrationError


def json_request(url, *, method='GET', headers=None, payload=None, timeout=15):
    body = None if payload is None else json.dumps(payload).encode('utf-8')
    request = Request(url, data=body, method=method, headers={
        'Accept': 'application/json',
        **({'Content-Type': 'application/json'} if body is not None else {}),
        **(headers or {}),
    })
    try:
        with urlopen(request, timeout=timeout) as response:
            raw = response.read()
            return json.loads(raw or b'{}')
    except HTTPError as exc:
        raw = exc.read()
        try:
            details = json.loads(raw or b'{}')
        except json.JSONDecodeError:
            details = {'body': raw.decode('utf-8', errors='replace')[:1000]}
        raise IntegrationError(
            details.get('message') or details.get('error') or f'Provider returned HTTP {exc.code}.',
            code='PROVIDER_HTTP_ERROR', status=502, details=details,
        ) from exc
    except (URLError, TimeoutError) as exc:
        raise IntegrationError('Unable to connect to the provider.', code='PROVIDER_UNAVAILABLE', status=503) from exc
