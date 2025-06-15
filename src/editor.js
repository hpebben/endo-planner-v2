import { registerBlockType } from '@wordpress/blocks';
import edit from './edit';
import save from './save';
import './styles/editor.scss';
import './styles/style.scss';

registerBlockType('endoplanner/v2-wizard', {
  apiVersion: 2,
  icon: 'admin-tools',
  edit,
  save,
});
