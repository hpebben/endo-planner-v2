import React from 'react';
import ReactDOM from 'react-dom';
import Wizard from './components/wizard';

document.addEventListener( 'DOMContentLoaded', () => {
    if ( document.body.classList.contains( 'block-editor-page' ) ) {
        return; // don't hydrate inside the editor
    }

    const blocks = document.querySelectorAll( '.wp-block-endoplanner-v2-wizard' );
    blocks.forEach( ( container ) => {
        ReactDOM.render( <Wizard />, container );
    } );
} );
