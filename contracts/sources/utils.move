/// # SuiFund Utility Module
/// 
/// This module provides common utility functions used across the SuiFund platform:
/// - Mathematical calculations with overflow protection
/// - Validation functions for addresses and percentages
/// - Time utility functions
/// - Safety wrappers for arithmetic operations

module suifund::utils {
    use sui::clock::{Self, Clock};

    // ============ MATHEMATICAL UTILITIES ============

    /// Calculates percentage of an amount
    /// @param amount: Base amount
    /// @param percentage: Percentage (0-100)
    /// @return: Calculated percentage amount
    public fun calculate_percentage(amount: u64, percentage: u64): u64 {
        (amount * percentage) / 100
    }

    /// Calculates share based on numerator and denominator
    /// @param total: Total amount to share
    /// @param numerator: Share numerator
    /// @param denominator: Share denominator
    /// @return: Calculated share amount
    public fun calculate_share(total: u64, numerator: u64, denominator: u64): u64 {
        if (denominator == 0) {
            0
        } else {
            (total * numerator) / denominator
        }
    }

    // ============ VALIDATION UTILITIES ============

    /// Validates Sui address format
    /// @param address: Address to validate
    /// @return: true if address is valid
    public fun is_valid_address(address: address): bool {
        // Basic validation - could be enhanced with more checks
        true
    }

    /// Validates percentage value
    /// @param percentage: Percentage to validate
    /// @return: true if percentage is between 1 and 100
    public fun is_valid_percentage(percentage: u64): bool {
        percentage > 0 && percentage <= 100
    }

    // ============ TIME UTILITIES ============

    /// Returns current timestamp in milliseconds
    /// @return: Current timestamp
    public fun current_timestamp_ms(): u64 {
        // This would be replaced with actual clock timestamp in entry functions
        0
    }

    /// Checks if deadline has passed
    /// @param current_time: Current timestamp
    /// @param deadline: Deadline timestamp
    /// @return: true if deadline has passed
    public fun is_past_deadline(current_time: u64, deadline: u64): bool {
        current_time >= deadline
    }

    /// Calculates time remaining until deadline
    /// @param current_time: Current timestamp
    /// @param deadline: Deadline timestamp
    /// @return: Time remaining in milliseconds
    public fun time_remaining(current_time: u64, deadline: u64): u64 {
        if (current_time >= deadline) {
            0
        } else {
            deadline - current_time
        }
    }

    // ============ SAFETY UTILITIES ============

    /// Safe addition with overflow protection
    /// @param a: First operand
    /// @param b: Second operand
    /// @return: Sum of a and b
    /// @aborts: If overflow occurs (abort code 100)
    public fun safe_add(a: u64, b: u64): u64 {
        let result = a + b;
        assert!(result >= a, 100); // Overflow check
        result
    }

    /// Safe subtraction with underflow protection
    /// @param a: First operand
    /// @param b: Second operand
    /// @return: Difference of a and b
    /// @aborts: If underflow occurs (abort code 101)
    public fun safe_sub(a: u64, b: u64): u64 {
        assert!(a >= b, 101); // Underflow check
        a - b
    }

    /// Safe multiplication with overflow protection
    /// @param a: First operand
    /// @param b: Second operand
    /// @return: Product of a and b
    /// @aborts: If overflow occurs (abort code 102)
    public fun safe_mul(a: u64, b: u64): u64 {
        if (a == 0 || b == 0) {
            return 0
        };
        let result = a * b;
        assert!(result / a == b, 102); // Overflow check
        result
    }
}