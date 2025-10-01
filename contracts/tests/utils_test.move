/// # Utility Module Tests
/// 
/// Comprehensive test suite for utility functions including:
/// - Mathematical calculations with edge cases
/// - Validation functions
/// - Safety wrappers with overflow/underflow protection
/// - Time utility functions

#[test_only]
module suifund::utils_test {
    use suifund::utils;

    /// Tests percentage calculation with various inputs
    #[test]
    fun test_calculate_percentage() {
        assert!(utils::calculate_percentage(100, 50) == 50, 0);
        assert!(utils::calculate_percentage(200, 25) == 50, 1);
        assert!(utils::calculate_percentage(0, 50) == 0, 2);
        assert!(utils::calculate_percentage(100, 0) == 0, 3);
        assert!(utils::calculate_percentage(100, 100) == 100, 4);
    }

    /// Tests share calculation with various ratios
    #[test]
    fun test_calculate_share() {
        assert!(utils::calculate_share(100, 1, 2) == 50, 0);
        assert!(utils::calculate_share(200, 1, 4) == 50, 1);
        assert!(utils::calculate_share(100, 0, 2) == 0, 2);
        assert!(utils::calculate_share(100, 1, 0) == 0, 3);
        assert!(utils::calculate_share(0, 1, 2) == 0, 4);
    }

    /// Tests safe mathematical operations
    #[test]
    fun test_safe_math() {
        assert!(utils::safe_add(100, 50) == 150, 0);
        assert!(utils::safe_sub(100, 50) == 50, 1);
        assert!(utils::safe_mul(10, 5) == 50, 2);
        assert!(utils::safe_mul(0, 5) == 0, 3);
        assert!(utils::safe_mul(10, 0) == 0, 4);
    }

    /// Tests safe addition overflow protection
    #[test]
    #[expected_failure(abort_code = 100)]
    fun test_safe_add_overflow() {
        utils::safe_add(18446744073709551615, 1);
    }

    /// Tests safe subtraction underflow protection
    #[test]
    #[expected_failure(abort_code = 101)]
    fun test_safe_sub_underflow() {
        utils::safe_sub(50, 100);
    }

    /// Tests safe multiplication overflow protection
    #[test]
    #[expected_failure(abort_code = 102)]
    fun test_safe_mul_overflow() {
        utils::safe_mul(18446744073709551615, 2);
    }

    /// Tests percentage validation
    #[test]
    fun test_is_valid_percentage() {
        assert!(utils::is_valid_percentage(1), 0);
        assert!(utils::is_valid_percentage(50), 1);
        assert!(utils::is_valid_percentage(100), 2);
        assert!(!utils::is_valid_percentage(0), 3);
        assert!(!utils::is_valid_percentage(101), 4);
    }

    /// Tests time utility functions
    #[test]
    fun test_time_utilities() {
        assert!(utils::is_past_deadline(1000, 500), 0);
        assert!(!utils::is_past_deadline(500, 1000), 1);
        assert!(utils::time_remaining(500, 1000) == 500, 2);
        assert!(utils::time_remaining(1000, 500) == 0, 3);
    }
}