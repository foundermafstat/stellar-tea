use soroban_sdk::{contracttype, Address, Env};

use crate::errors::GameError;

#[derive(Clone)]
#[contracttype]
pub enum PaymentToken {
    Balls,
    Stars,
}

#[derive(Clone)]
#[contracttype]
pub struct Listing {
    pub seller: Address,
    pub price: i128,
    pub payment_token: PaymentToken,
    pub created_at: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Listing(u64),
}

pub fn set(env: &Env, token_id: u64, listing: &Listing) {
    env.storage()
        .persistent()
        .set(&DataKey::Listing(token_id), listing);
}

pub fn get(env: &Env, token_id: u64) -> Result<Listing, GameError> {
    env.storage()
        .persistent()
        .get::<DataKey, Listing>(&DataKey::Listing(token_id))
        .ok_or(GameError::OfferNotFound)
}

pub fn remove(env: &Env, token_id: u64) {
    env.storage()
        .persistent()
        .remove(&DataKey::Listing(token_id));
}
