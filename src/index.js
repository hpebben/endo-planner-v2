/**
 * Registers the block with WordPress, pulling in block.json and
 * wiring up the `edit` and `save` functions.
 */

import './styles/editor.scss';
// If you ever have front‐end-only styles, you could import them here.
// For now, we only need `editor.scss` so the editor UI is styled correctly.

import edit from './edit';
import save from './save';

import metadata from '../block.json';
import { registerBlockType } from '@wordpress/blocks';

registerBlockType( metadata.name, {
    edit,
    save,
} );
