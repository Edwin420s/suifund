#[test_only]
module suifund::utils_test {
    use suifund::utils;

    #[test]
    fun test_calculate_percentage() {
        assert!(utils::calculate_percentage(100, 50) == 50, 0);
        assert!(utils::calculate_percentage(200, 25) == 50, 1);
        assert!(utils::calculate_percentage(0, 50) == 0, 2);
    }

    #[test]
    fun test_calculate_share() {
        assert!(utils::calculate_share(100, 1, 2) == 50, 0);
        assert!(utils::calculate_share(200, 1, 4) == 50, 1);
        assert!(utils::calculate_share(100, 0, 2) == 0, 2);
        assert!(utils::calculate_share(100, 1, 0) == 0, 3);
    }

    #[test]
    fun test_safe_math() {
        assert!(utils::safe_add(100, 50) == 150, 0);
        assert!(utils::safe_sub(100, 50) == 50, 1);
        assert!(utils::safe_mul(10, 5) == 50, 2);
    }

    #[test]
    #[expected_failure(abort_code = 100)]
    fun test_safe_add_overflow() {
        utils::safe_add(18446744073709551615, 1);
    }

    #[test]
    #[expected_failure(abort_code = 101)]
    fun test_safe_sub_underflow() {
        utils::safe_sub(50, 100);
    }
}