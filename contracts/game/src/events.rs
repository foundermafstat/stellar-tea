use soroban_sdk::{contracttype, Address, Env, Vec};

use crate::errors::GameError;

#[derive(Clone)]
#[contracttype]
pub struct Event {
    pub organizer: Address,
    pub stake: i128,
    pub reward_pool: i128,
    pub participants: Vec<Address>,
    pub deadline: u64,
    pub finished: bool,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Event(u32),
}

pub fn get(env: &Env, event_id: u32) -> Result<Event, GameError> {
    env.storage()
        .persistent()
        .get::<DataKey, Event>(&DataKey::Event(event_id))
        .ok_or(GameError::OfferNotFound)
}

pub fn set(env: &Env, event_id: u32, event: &Event) {
    env.storage()
        .persistent()
        .set(&DataKey::Event(event_id), event);
}

pub fn ensure_active(event: &Event, env: &Env) -> Result<(), GameError> {
    if event.finished {
        return Err(GameError::OfferClosed);
    }
    if env.ledger().timestamp() > event.deadline {
        return Err(GameError::Expired);
    }
    Ok(())
}
