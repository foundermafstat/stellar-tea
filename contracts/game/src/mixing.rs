use soroban_sdk::{contracttype, Address, Env, String};

use crate::errors::GameError;

#[derive(Clone, PartialEq, Eq)]
#[contracttype]
pub enum OfferStatus {
    WaitingForPartner,
    ReadyToMix,
    Completed,
    Cancelled,
}

#[derive(Clone)]
#[contracttype]
pub struct MixOffer {
    pub owner_a: Address,
    pub token_a_id: u64,
    pub owner_b: Option<Address>,
    pub token_b_id: Option<u64>,
    pub desired_profile: String,
    pub min_rank: u32,
    pub recipe_id: u32,
    pub fee_balls: i128,
    pub fee_stars: i128,
    pub partner_fee_balls: i128,
    pub partner_fee_stars: i128,
    pub status: OfferStatus,
    pub created_at: u64,
    pub deadline: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Offer(u64),
    Sequence,
    OwnerIndex(Address, u32),
}

pub trait BeverageMixer {
    fn decide_winner(
        env: &Env,
        offer: &MixOffer,
        token_b_id: u64,
    ) -> Result<(Address, Address), GameError>;
}

pub fn next_id(env: &Env) -> u64 {
    let mut seq = env
        .storage()
        .persistent()
        .get::<DataKey, u64>(&DataKey::Sequence)
        .unwrap_or(0);
    seq += 1;
    env.storage().persistent().set(&DataKey::Sequence, &seq);
    seq
}

pub fn put(env: &Env, id: u64, offer: &MixOffer) {
    env.storage().persistent().set(&DataKey::Offer(id), offer);
}

pub fn get(env: &Env, id: u64) -> Result<MixOffer, GameError> {
    env.storage()
        .persistent()
        .get::<DataKey, MixOffer>(&DataKey::Offer(id))
        .ok_or(GameError::OfferNotFound)
}

pub fn remove(env: &Env, id: u64) {
    env.storage().persistent().remove(&DataKey::Offer(id));
}

pub fn set_owner_index(env: &Env, owner: &Address, recipe_id: u32, offer_id: u64) {
    env.storage()
        .persistent()
        .set(&DataKey::OwnerIndex(owner.clone(), recipe_id), &offer_id);
}

pub fn clear_owner_index(env: &Env, owner: &Address, recipe_id: u32) {
    env.storage()
        .persistent()
        .remove(&DataKey::OwnerIndex(owner.clone(), recipe_id));
}

pub fn get_by_owner_recipe(env: &Env, owner: &Address, recipe_id: u32) -> Option<u64> {
    env.storage()
        .persistent()
        .get::<DataKey, u64>(&DataKey::OwnerIndex(owner.clone(), recipe_id))
}

#[cfg(test)]
mod tests {
    extern crate std;

    use soroban_sdk::{contract, testutils::Address as _, Address, Env, String};

    use super::*;

    #[contract]
    struct Dummy;

    #[test]
    fn sequence_and_index_work() {
        let env = Env::default();
        let owner = Address::generate(&env);
        let other = Address::generate(&env);

        let contract_id = env.register_contract(None, Dummy);
        env.as_contract(&contract_id, || {
            let id1 = next_id(&env);
            let id2 = next_id(&env);
            assert_eq!(id1 + 1, id2);

            let offer = MixOffer {
                owner_a: owner.clone(),
                token_a_id: 1,
                owner_b: None,
                token_b_id: None,
                desired_profile: String::from_str(&env, "citrus"),
                min_rank: 1,
                recipe_id: 7,
                fee_balls: 100,
                fee_stars: 10,
                partner_fee_balls: 0,
                partner_fee_stars: 0,
                status: OfferStatus::WaitingForPartner,
                created_at: env.ledger().timestamp(),
                deadline: env.ledger().timestamp() + 1000,
            };

            set_owner_index(&env, &owner, offer.recipe_id, id1);
            put(&env, id1, &offer);

            assert_eq!(
                get_by_owner_recipe(&env, &owner, offer.recipe_id),
                Some(id1)
            );
            assert!(get_by_owner_recipe(&env, &other, offer.recipe_id).is_none());

            clear_owner_index(&env, &owner, offer.recipe_id);
            remove(&env, id1);
            assert!(get_by_owner_recipe(&env, &owner, offer.recipe_id).is_none());
        });
    }
}
