/// # SuiFund NFT Module
/// 
/// This module handles Supporter NFT functionality including:
/// - NFT minting for campaign contributors
/// - NFT metadata and benefit tracking
/// - NFT transfer functionality
/// - Event emission for NFT actions

module suifund::nft {
    use std::string::{String, utf8};
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::url::{Self, Url};

    /// Supporter NFT representing campaign contribution
    struct SupporterNFT has key, store {
        id: UID,
        campaign_id: ID,          /// Associated campaign ID
        contributor: address,     /// Contributor's address
        amount: u64,             /// Contribution amount in MIST
        timestamp: u64,          /// Contribution timestamp
        image_url: Url,          /// NFT image URL
        tier: String,            /// Contributor tier (Bronze, Silver, Gold)
        benefits: vector<String> /// NFT benefits and perks
    }

    /// Event emitted when NFT is minted
    struct NFTMinted has copy, drop {
        nft_id: ID,
        campaign_id: ID,
        contributor: address,
        amount: u64,
        tier: String
    }

    /// Mints a new Supporter NFT for a campaign contributor
    public fun mint_supporter_nft(
        campaign_id: ID,
        contributor: address,
        amount: u64,
        timestamp: u64,
        image_url: vector<u8>,
        tier: vector<u8>,
        benefits: vector<vector<u8>>,
        ctx: &mut TxContext
    ): SupporterNFT {
        let benefits_vec = vector::empty();
        let i = 0;
        let len = vector::length(&benefits);
        
        // Convert benefits to String vector
        while (i < len) {
            vector::push_back(&mut benefits_vec, utf8(vector::borrow(&benefits, i)));
            i = i + 1;
        };

        let nft = SupporterNFT {
            id: object::new(ctx),
            campaign_id,
            contributor,
            amount,
            timestamp,
            image_url: url::new_unsafe_from_bytes(image_url),
            tier: utf8(tier),
            benefits: benefits_vec
        };

        // Emit minting event
        sui::event::emit(NFTMinted {
            nft_id: object::id(&nft),
            campaign_id,
            contributor,
            amount,
            tier: utf8(tier)
        });

        nft
    }

    /// Transfers NFT to another address
    public entry fun transfer_nft(
        nft: SupporterNFT,
        recipient: address,
        ctx: &mut TxContext
    ) {
        transfer::transfer(nft, recipient);
    }

    /// Returns NFT information for external queries
    public fun get_nft_info(nft: &SupporterNFT): (ID, address, u64, u64, String, vector<String>) {
        (
            nft.campaign_id,
            nft.contributor,
            nft.amount,
            nft.timestamp,
            nft.tier,
            nft.benefits
        )
    }
}