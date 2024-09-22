#include <emscripten/emscripten.h>
#include <stdbool.h>
#include <math.h>

using namespace std;

#ifdef __cplusplus
#define EXTERN extern "C"
#else
#define EXTERN
#endif

EXTERN EMSCRIPTEN_KEEPALIVE int generatePrime(int n) {
    int i, j, count = 0;
    for (i = 2; count < n; i++) {
        for (j = 2; j <= i; j++) {
            if (i % j == 0) {
                break;
            }
        }
        if (j == i) {
            count++;
        }
    }
    return i - 1;
}

EXTERN EMSCRIPTEN_KEEPALIVE int generatePrimeSieve(int n) {
    if (n < 1) return -1; // return error if n is less than 1
    
    int count = 0;  // Count of primes found
    int candidate = 2;  // Number to check for primality
    
    while (count < n) {
        bool isPrime = true;
        if (candidate == 2) {
            count++;  // 2 is the first prime number
        } else {
            if (candidate % 2 == 0) {
                isPrime = false;  // Exclude even numbers
            } else {
                // Only check odd divisors up to the square root of the candidate
                for (int divisor = 3; divisor <= sqrt(candidate) && isPrime; divisor += 2) {
                    if (candidate % divisor == 0) {
                        isPrime = false;
                    }
                }
            }
            if (isPrime) {
                count++;  // Increment count of prime numbers
            }
        }
        if (count < n) candidate++;  // Only increment if we still need more primes
    }
    
    return candidate;
}
