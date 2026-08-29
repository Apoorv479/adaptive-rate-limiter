local key = KEYS[1]

local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local requested_tokens = tonumber(ARGV[3])
local now = tonumber(ARGV[4])

local data = redis.call("HMGET", key, "tokens", "last_refill")

local tokens = tonumber(data[1])
local last_refill = tonumber(data[2])

if tokens == nil then
    tokens = capacity
    last_refill = now
end

local elapsed = (now - last_refill) / 1000
local refill = elapsed * refill_rate

tokens = math.min(capacity, tokens + refill)
last_refill = now

local allowed = 0

if tokens >= requested_tokens then
    tokens = tokens - requested_tokens
    allowed = 1
end

redis.call(
    "HSET",
    key,
    "tokens",
    tokens,
    "last_refill",
    last_refill
)

redis.call(
    "EXPIRE",
    key,
    math.ceil(capacity / refill_rate) + 60
)

return {
    allowed,
    tokens
}