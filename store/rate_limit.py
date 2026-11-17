import hashlib
import time
from functools import wraps

from django.core.cache import cache
from django.http import JsonResponse


def rate_limit(*, scope, limit, window):
    """Small fixed-window limiter for public APIs; shared caches work across workers."""
    def decorator(view):
        @wraps(view)
        def wrapped(request, *args, **kwargs):
            identity = request.META.get('REMOTE_ADDR') or 'unknown'
            bucket = int(time.time() // window)
            digest = hashlib.sha256(f'{scope}:{identity}:{bucket}'.encode()).hexdigest()
            key = f'api-rate:{digest}'
            cache.add(key, 0, timeout=window + 1)
            try:
                count = cache.incr(key)
            except ValueError:
                cache.set(key, 1, timeout=window + 1)
                count = 1
            if count > limit:
                retry_after = window - (int(time.time()) % window)
                response = JsonResponse({
                    'detail': 'Too many requests. Please wait and try again.',
                    'code': 'RATE_LIMITED',
                }, status=429)
                response['Retry-After'] = str(max(retry_after, 1))
                return response
            return view(request, *args, **kwargs)
        return wrapped
    return decorator
