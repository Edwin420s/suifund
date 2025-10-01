module suifund::utils {
    use sui::clock::{Self, Clock};

    // Math utilities
    public fun calculate_percentage(amount: u64, percentage: u64): u64 {
        (amount * percentage) / 100
    }

    public fun calculate_share(total: u64, numerator: u64, denominator: u64): u64 {
        if (denominator == 0) {
            0
        } else {
            (total * numerator) / denominator
        }
    }

    // Validation utilities
    public fun is_valid_address(address: address): bool {
        // Basic validation - could be enhanced with more checks
        true
    }

    public fun is_valid_percentage(percentage: u64): bool {
        percentage > 0 && percentage <= 100
    }

    // Time utilities
    public fun current_timestamp_ms(): u64 {
        // This would be replaced with actual clock timestamp in entry functions
        0
    }

    public fun is_past_deadline(current_time: u64, deadline: u64): bool {
        current_time >= deadline
    }

    public fun time_remaining(current_time: u64, deadline: u64): u64 {
        if (current_time >= deadline) {
            0
        } else {
            deadline - current_time
        }
    }

    // Safety utilities to prevent integer overflow
    public fun safe_add(a: u64, b: u64): u64 {
        let result = a + b;
        assert!(result >= a, 100); // Overflow check
        result
    }

    public fun safe_sub(a: u64, b: u64): u64 {
        assert!(a >= b, 101); // Underflow check
        a - b
    }

    public fun safe_mul(a: u64, b: u64): u64 {
        if (a == 0 || b == 0) {
            return 0
        };
        let result = a * b;
        assert!(result / a == b, 102); // Overflow check
        result
    }
}