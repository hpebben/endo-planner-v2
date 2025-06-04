/**
 * src/index.js
 *
 * Entry point for webpack / @wordpress/scripts.
 * This registers our block type using the block.json manifest
 * and points to the `edit()` and `save()` implementations.
 */

import { registerBlockType } from '@wordpress/blocks';
import edit from './edit';
import save from './save';

registerBlockType( 'endoplanner/v2-wizard', {
    apiVersion: 2,
    icon: 'admin-tools',
    edit,
    save,
} );
