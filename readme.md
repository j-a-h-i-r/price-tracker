
A small utility to compare prices across multiple websites, check price trends and track product for desired price tragets.

> Right now, this project is hyper-local and only really useful for getting prices in Bangladesh.

### Features

Currently, following features are implemented,
- Scraping price and availability information on regular intervals
- API to get historical product price/availability data
- Get email alerts when price changes
- Compare the price/availability of multiple products across multiple websites

## Development Notes

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
        "EndpointID": "",
        "MacAddress": "",
        "IPv4Address": "172.21.0.2/16",
        "IPv6Address": ""
    },
    "d061a0a71040329af624245924e": {
        "Name": "signoz-otel-collector",
        "EndpointID": "",
        "MacAddress": "",
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