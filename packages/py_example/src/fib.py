def fib(n):
    """Compute Fibonacci number recursively."""
    return n if n < 2 else fib(n - 1) + fib(n - 2)
