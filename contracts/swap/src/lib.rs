#![no_std]

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, symbol_short, token, Address, Env, IntoVal,
};

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Config,
}

#[contracttype]
#[derive(Clone)]
pub struct Config {
    pub owner: Address,
    pub stars_token: Address,
    pub treasury: Address,
    pub xlm_token: Address,
}

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq)]
pub enum SwapError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    InvalidAmount = 3,
    Unauthorized = 4,
}

#[contract]
pub struct Swap;

#[contractimpl]
impl Swap {
    pub fn init(
        env: Env,
        owner: Address,
        stars_token: Address,
        treasury: Address,
        xlm_token: Address,
    ) -> Result<(), SwapError> {
        let storage = env.storage().instance();
        if storage.has(&DataKey::Config) {
            return Err(SwapError::AlreadyInitialized);
        }

        owner.require_auth();

        let config = Config {
            owner: owner.clone(),
            stars_token: stars_token.clone(),
            treasury: treasury.clone(),
            xlm_token: xlm_token.clone(),
        };

        storage.set(&DataKey::Config, &config);

        env.events()
            .publish(("swap_init",), (owner, stars_token, treasury, xlm_token));

        Ok(())
    }

    pub fn get_config(env: Env) -> Result<Config, SwapError> {
        Self::config(&env)
    }

    pub fn swap(
        env: Env,
        initiator: Address,
        recipient: Address,
        stars_amount: i128,
        xlm_amount: i128,
    ) -> Result<(), SwapError> {
        if xlm_amount <= 0 {
            return Err(SwapError::InvalidAmount);
        }

        if stars_amount <= 0 {
            return Err(SwapError::InvalidAmount);
        }

        initiator.require_auth();

        let config = Self::config(&env)?;
        let treasury = config.treasury.clone();

        let xlm_client = token::TokenClient::new(&env, &config.xlm_token);
        xlm_client.transfer(&initiator, &treasury, &xlm_amount);

        let recipient_clone = recipient.clone();
        let args = (&recipient, stars_amount).into_val(&env);
        env.invoke_contract::<()>(&config.stars_token, &symbol_short!("mint"), args);

        env.events().publish(
            ("swap",),
            (initiator, recipient_clone, stars_amount, xlm_amount),
        );

        Ok(())
    }

    pub fn set_token(env: Env, owner: Address, stars_token: Address) -> Result<(), SwapError> {
        let storage = env.storage().instance();
        let mut config = Self::config(&env)?;

        if owner != config.owner {
            return Err(SwapError::Unauthorized);
        }
        owner.require_auth();

        config.stars_token = stars_token.clone();
        storage.set(&DataKey::Config, &config);

        env.events().publish(("swap_token_updated",), stars_token);

        Ok(())
    }

    pub fn set_treasury(env: Env, owner: Address, treasury: Address) -> Result<(), SwapError> {
        let storage = env.storage().instance();
        let mut config = Self::config(&env)?;

        if owner != config.owner {
            return Err(SwapError::Unauthorized);
        }
        owner.require_auth();

        config.treasury = treasury.clone();
        storage.set(&DataKey::Config, &config);

        env.events().publish(("swap_treasury_updated",), treasury);

        Ok(())
    }

    pub fn set_xlm_token(env: Env, owner: Address, xlm_token: Address) -> Result<(), SwapError> {
        let storage = env.storage().instance();
        let mut config = Self::config(&env)?;

        if owner != config.owner {
            return Err(SwapError::Unauthorized);
        }
        owner.require_auth();

        config.xlm_token = xlm_token.clone();
        storage.set(&DataKey::Config, &config);

        env.events().publish(("swap_xlm_token_updated",), xlm_token);

        Ok(())
    }

    fn config(env: &Env) -> Result<Config, SwapError> {
        let storage = env.storage().instance();
        storage
            .get(&DataKey::Config)
            .ok_or(SwapError::NotInitialized)
    }
}
