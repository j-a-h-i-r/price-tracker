import { GpuPriceChange } from '../../types';
import {
    prepareFormattedMessageForPostingToFacebook
} from '../events';

describe('Test facebook message posting', () => {
    test('Correct formatting for no GPU change', () => {
        const post = prepareFormattedMessageForPostingToFacebook([]);
        expect(post).toEqual(
            'GPU Price Update\n\n'
        );
    });

    test('Correct format for a list of GPU change', () => {
        const priceChanges: GpuPriceChange[] = [
            {
                gpuid: 1,
                name: '',
                url: 'https://sample/product',
                isAvailable: true,
                lastPrice: 10,
                hasPriceChanged: true,
                hasAvailabilityChanged: true,
                previousPrice: 5,
                priceDiff: 5,
                changes: []
            }
        ];
        const post = prepareFormattedMessageForPostingToFacebook(priceChanges);
        expect(post).toEqual(
            'GPU Price Update\n\n\n'
            + 'New Price: 10 (5 📈)\n'
            + 'Link: https://sample/product\n'
        );
    });
});
