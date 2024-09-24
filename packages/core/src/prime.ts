// Helper function to determine if a number is prime
function isPrime(num: number): boolean {
    if (num < 2) return false;
    if (num === 2) return true; // 2 is the only even prime number
    if (num % 2 === 0) return false; // exclude even numbers

    // Check for divisors up to the square root of the number
    for (let i = 3; i <= Math.sqrt(num); i += 2) {
        if (num % i === 0) return false;
    }
    return true;
}

// Function to generate the nth prime using a basic method
export function generatePrime(n: number): number {
    let count = 0;
    let i = 2;

    while (count < n) {
        if (isPrime(i)) {
            count++;
        }
        i++;
    }
    
    return i - 1; // Subtract 1 to get the actual nth prime number
}

// Function to generate the nth prime using a sieve-like method
export function generatePrimeSieve(n: number): number {
    if (n < 1) return -1; // return error if n is less than 1

    let count = 0;  // Count of primes found
    let candidate = 2;  // Number to check for primality

    while (count < n) {
        if (candidate === 2) {
            count++;  // 2 is the first prime number
        } else if (isPrime(candidate)) {
            count++;  // Increment count if the candidate is prime
        }
        if (count < n) candidate++;  // Only increment if we still need more primes
    }
    
    return candidate;
}
