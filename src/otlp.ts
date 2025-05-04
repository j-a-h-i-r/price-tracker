import opentelemetry from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import {
  PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import FastifyOtelInstrumentation from '@fastify/otel';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import config from './core/config.js';
import constants from './core/constants.js';

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

export const sdk = new NodeSDK({
  // Register the service name and version
  resource: resource,
  // OTLPTraceExporter will export tracees to the signoz backend
  traceExporter: new OTLPTraceExporter({
    url: `${SIGNOZ_ENDPOINT}/v1/traces`,
  }),
  // OTLPMetricExporter will export metrics to the signoz backend
  metricReader: metricReader,
});

export const fastifyOtelInstrumentation = new FastifyOtelInstrumentation({ servername: constants.OTLP_SERVICE_NAME });
fastifyOtelInstrumentation.setTracerProvider(opentelemetry.trace.getTracerProvider());
