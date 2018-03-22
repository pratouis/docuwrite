import React from 'react';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import FlatButton from 'material-ui/FlatButton';

import FormatBold from 'material-ui/svg-icons/editor/format-bold'
import FormatItalic from 'material-ui/svg-icons/editor/format-italic'
import FormatUnderlined from 'material-ui/svg-icons/editor/format-underlined'

import FormatAlignCenter from 'material-ui/svg-icons/editor/format-align-center'
import FormatAlignLeft from 'material-ui/svg-icons/editor/format-align-left'
import FormatAlignRight from 'material-ui/svg-icons/editor/format-align-right'

import FormatSize from 'material-ui/svg-icons/editor/format-Size'
import FormatColorText from 'material-ui/svg-icons/editor/format-color-text'


import FormatListBulleted from 'material-ui/svg-icons/editor/format-list-bulleted'
import FormatListNumbered from 'material-ui/svg-icons/editor/format-list-Numbered'


import createStyles from 'draft-js-custom-styles';
import {connect} from 'react-redux';

const customStyleMap = {
  MARK: {
    backgroundColor: 'Yellow',
    fontStyle: 'italic'
  }
};

// Passing the customStyleMap is optional
const { styles, customStyleFn, exporter } = createStyles([
  'font-size', 'color', 'font-weight', 'font-style', 'text-decoration', 'text-align'
], 'CUSTOM_', customStyleMap);

export default class Textbar extends React.Component {
  toggleBold = (e) => {
    e.preventDefault();
    const newEditorState = styles.fontWeight.toggle(this.props.editorState, 'bold');
    console.log(this)
    this.handleEditorChange(newEditorState);
  };

  toggleItalic = (e) => {
    e.preventDefault();
    const newEditorState = styles.fontStyle.toggle(this.props.editorState, 'italic');
    this.handleEditorChange(newEditorState);
  };

  toggleUnderline = (e) => {
    e.preventDefault();
    const newEditorState = styles.textDecoration.toggle(this.props.editorState, 'underline');
    this.handleEditorChange(newEditorState);
  };

  handleEditorChange = (editorState) => {
    // debugger;
    this.props.updateEditor(editorState);
  }

  render() {
    let styles = this.props.editorState.getCurrentInlineStyle().toJS();
    return (
      <div style={{
        'position': 'sticky',
        'top': '0px'
      }}>
        <Toolbar title="My Toolbar" style={{'display':'flex', 'alignItems': 'center'}}>

          <FormatBold onMouseDown={this.toggleBold}
                      color={styles.includes("CUSTOM_FONT_WEIGHT_bold") ? 'black' : 'white'}
                    />

          <FormatItalic onMouseDown={this.toggleItalic}
                        color={styles.includes("CUSTOM_FONT_STYLE_italic") ? 'black' : 'white'}
                      />

          <FormatUnderlined onMouseDown={this.toggleUnderline}
                            color={styles.includes("CUSTOM_TEXT_DECORATION_underline") ? 'black' : 'white'}/>

          <FormatAlignLeft hoverColor={'black'} color={'white'}/>

          <FormatAlignCenter hoverColor={'black'} color={'white'}/>

          <FormatAlignRight hoverColor={'black'} color={'white'}/>

          <FormatSize hoverColor={'black'} color={'white'}/>

          <FormatColorText hoverColor={'black'} color={'black'}/>

          <FormatListBulleted hoverColor={'black'} color={'white'}/>

          <FormatListNumbered hoverColor={'black'} color={'white'}/>

        </Toolbar>
      </div>
    );
  }
}
