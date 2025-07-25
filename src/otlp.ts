import opentelemetry from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import FastifyOtelInstrumentation from '@fastify/otel';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import config from './core/config.ts';
import constants from './core/constants.ts';
import { HostMetrics } from '@opentelemetry/host-metrics';

const SIGNOZ_ENDPOINT = config.signozEndpoint;

export const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: constants.OTLP_SERVICE_NAME,
  [ATTR_SERVICE_VERSION]: constants.OTLP_SERVICE_VERSION,
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: new OTLPMetricExporter({
    url: `${SIGNOZ_ENDPOINT}/v1/metrics`,
  }),
});

// Create a meter provider. All the metrics will be created 
// under "meter" derived from this provider
export const metricProvider = new MeterProvider({
  readers: [metricReader],
});

const hostMetrics = new HostMetrics({meterProvider: metricProvider});
hostMetrics.start();

export const sdk = new NodeSDK({
  // Register the service name and version
  resource: resource,
  // OTLPTraceExporter will export tracees to the signoz backend
  traceExporter: new OTLPTraceExporter({
    url: `${SIGNOZ_ENDPOINT}/v1/traces`,
  }),
  serviceName: constants.OTLP_SERVICE_NAME,
});

export const fastifyOtelInstrumentation = new FastifyOtelInstrumentation({ servername: constants.OTLP_SERVICE_NAME });
fastifyOtelInstrumentation.setTracerProvider(opentelemetry.trace.getTracerProvider());
