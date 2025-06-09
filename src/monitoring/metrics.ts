import { ValueType } from '@opentelemetry/api';
import constants from '../core/constants.ts';
import { metricProvider } from '../otlp.ts';

/**
 * Defines a list of metrics that are exported from the application
 */

const meter = metricProvider.getMeter(constants.OTLP_SERVICE_NAME, constants.OTLP_SERVICE_VERSION);

export const scrapedWebsiteCategoryGauge = meter.createGauge('scraped_category', {
    description: 'Number of products scraped from a specific category for a specific website',
    unit: 'products',
    valueType: ValueType.INT,
});
