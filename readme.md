
A small utility Backend and API to check GPU prices and view price/availability trends.

> Right now, this project is hyper-local and only really useful for getting GPU prices in Bangladesh.

#### Why?

I got tired of manually refreshing GPU listings to see if there's any updates

### Features

Currently, following features are implemented,
- Scraping price and availability information on regular intervals
- API to get historical GPU price/availability data
- Get email alerts when GPU price/availability changes
- Compare the price/availability of multiple GPUs under same model number 

A frontend client for easy viewing is in progress...

### Setting up open telemetry in server

Install signoz on the host. They have a repo with docker compose set up.

- Create a docker network `docker network create price-tracker-otlp`
- Add signoz container to this network `docker network connect price-tracker-otlp signoz-otel-collector`
- Find out the port of the dokku app `dokku ps`

```
3988d0   dokku/price-tracker:latest "/start web"  About a minute ago   Up About a minute  price-tracker.web.1
```
- Add the service to the network `docker network connect price-tracker-otlp price-tracker.web.1`
- Verify both containers are connected `docker network inspect price-tracker-otlp`

```
"Containers": {
    "3988d0cc48820ec2764da0e76c": {
        "Name": "price-tracker.web.1",
        "EndpointID": "1b749ad75d78d971a",
        "MacAddress": "46:6f:7f",
        "IPv4Address": "172.21.0.2/16",
        "IPv6Address": ""
    },
    "d061a0a71040329af624245924e": {
        "Name": "signoz-otel-collector",
        "EndpointID": "cb738fd1834b1b96fcad2bab8d",
        "MacAddress": "ee:4c:2e",
        "IPv4Address": "172.21.0.3/16",
        "IPv6Address": ""
    }
},
```
- Set the following envs. The address are from the `IPv4Address` of `signoz-otel-collector`


`OTEL_EXPORTER_OTLP_LOGS_ENDPOINT` = `http://172.21.0.3:4318/v1/logs`
`SIGNOZ_ENDPOINT` = `http://172.21.0.3:4318`

### Migrations

If knex migration doesn't work then run it like this `NODE_OPTIONS='--loader ts-node/esm' knex migrate:latest;`