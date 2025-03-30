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

const SIGNOZ_ENDPOINT = 'http://localhost:4318';
const SERVICE_NAME = 'price-tracker';
const SERVICE_VERSION = '1.0';

const sdk = new NodeSDK({
  // Register the service name and version
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: SERVICE_VERSION,
  }),
  // OTLPTraceExporter will export tracees to the signoz backend
  traceExporter: new OTLPTraceExporter({
    url: `${SIGNOZ_ENDPOINT}/v1/traces`,
  }),
  // OTLPMetricExporter will export metrics to the signoz backend
  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter({
      url: `${SIGNOZ_ENDPOINT}/v1/metrics`,
    }),
  }),
});

export const fastifyOtelInstrumentation = new FastifyOtelInstrumentation.default({ servername: SERVICE_NAME });
fastifyOtelInstrumentation.setTracerProvider(opentelemetry.trace.getTracerProvider())

sdk.start();
