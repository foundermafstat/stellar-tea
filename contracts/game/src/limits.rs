use soroban_sdk::{contracttype, Address, Env, Symbol};

use crate::errors::GameError;

#[derive(Clone)]
#[contracttype]
pub struct DailyLimit {
    pub value: i128,
    pub used: i128,
    pub day: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Limit(Address, Symbol),
}

fn current_day(env: &Env) -> u64 {
    env.ledger().timestamp() / 86_400
}

pub fn set_limit(env: &Env, user: &Address, limit_type: &Symbol, value: i128) {
    let record = DailyLimit {
        value,
        used: 0,
        day: current_day(env),
    };
    env.storage()
        .persistent()
        .set(&DataKey::Limit(user.clone(), limit_type.clone()), &record);
}

pub fn consume(
    env: &Env,
    user: &Address,
    limit_type: &Symbol,
    amount: i128,
) -> Result<(), GameError> {
    let key = DataKey::Limit(user.clone(), limit_type.clone());
    let mut record = env
        .storage()
        .persistent()
        .get::<DataKey, DailyLimit>(&key)
        .unwrap_or(DailyLimit {
            value: i128::MAX,
            used: 0,
            day: current_day(env),
        });

    let today = current_day(env);
    if record.day != today {
        record.day = today;
        record.used = 0;
    }

    if record.used + amount > record.value {
        return Err(GameError::LimitExceeded);
    }

    record.used += amount;
    env.storage().persistent().set(&key, &record);
    Ok(())
}

#[cfg(test)]
mod tests {
    extern crate std;

    use soroban_sdk::{
        contract, symbol_short,
        testutils::{Address as _, Ledger},
        Address, Env,
    };

    #[contract]
    struct Dummy;

    use super::*;

    #[test]
    fn limit_consumption_and_reset() {
        let env = Env::default();
        let user = Address::generate(&env);
        let limit_type = symbol_short!("mix");

        let contract_id = env.register_contract(None, Dummy);
        env.as_contract(&contract_id, || {
            set_limit(&env, &user, &limit_type, 2);
            consume(&env, &user, &limit_type, 1).unwrap();
            consume(&env, &user, &limit_type, 1).unwrap();
            assert!(consume(&env, &user, &limit_type, 1).is_err());

            env.ledger()
                .set_timestamp(env.ledger().timestamp() + 86_400 + 1);
            consume(&env, &user, &limit_type, 2).unwrap();
        });
    }
}
