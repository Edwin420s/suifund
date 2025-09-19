module suifund::utils {
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};

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
    public fun is_valid_address(_address: address): bool {
        // Basic validation - in real implementation would have more checks
        true
    }

    public fun is_valid_percentage(percentage: u64): bool {
        percentage <= 100
    }

    // Time utilities
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
}