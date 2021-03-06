import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {Editor, EditorState, RichUtils, convertToRaw, Modifier} from 'draft-js';
import {OrderedSet} from 'immutable';
import Paper from 'material-ui/Paper';
import Textbar from './Toolbar';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import TextField from 'material-ui/TextField';
import createStyles from 'draft-js-custom-styles';
import {getDefaultKeyBinding, KeyBindingUtil} from 'draft-js';
const {hasCommandModifier} = KeyBindingUtil;
import RaisedButton from 'material-ui/RaisedButton';
import Home from 'material-ui/svg-icons/action/Home'


const customStyleMap = {
  MARK: {
    backgroundColor: 'Yellow',
    fontStyle: 'italic'
  }
};

const ALIGNMENT_DATA_KEY = 'textAlignment';
const blockStyleFn = (contentBlock) => {
  const textAlignStyle = contentBlock.getData().get(ALIGNMENT_DATA_KEY);
  switch (textAlignStyle) {
    case 'RIGHT':
      return `align-right`;
    case 'CENTER':
      return `align-center`;
    case 'LEFT':
      return `align-left`;
    case 'JUSTIFY':
      return `align-justify`;
  }
}

//bind the cmd-b, cmd-i, and cmd-u keys to trigger style toggles
const myKeyBindingFn = (e: SyntheticKeyboardEvent): string => {
  if (e.keyCode === 66 /* `b` key */ && hasCommandModifier(e)) {
    return 'bold';
  }
  if (e.keyCode === 73 /* `b` key */ && hasCommandModifier(e)) {
    return 'italic';
  }
  if (e.keyCode === 85 /* `b` key */ && hasCommandModifier(e)) {
    return 'underline';
  }
  return getDefaultKeyBinding(e);
}

// Passing the customStyleMap is optional
const {styles, customStyleFn, exporter} = createStyles([
  'font-size', 'color', 'font-weight', 'font-style', 'text-decoration', 'text-align'
], 'CUSTOM_', customStyleMap);

class TextEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      intervalHandler: null
    }
    const { handleUpdate } = this.props;
    this.props.socket.on('updated-doc', ({ title, state })=> {
      handleUpdate(state, title)
    });
  }
  componentDidMount() {
    const _saveDocs = this.saveDoc.bind(this);
    this.setState({ intervalHandler: _saveDocs() });
  }
  componentWillUnmount() {
    clearInterval(this.state.intervalHandler);
    this.props.socket.off();
  }
    // Update editor state & selection state then pass these new states to the UPDATE action
  // This will result in the reducer signaling updates to the DOM

  /*  Take in newly changed draftJS editor state & format correctly for use in redux Action
        Occurs for both:
            1) Any changes to Editor
            2) Any interactions with Toolbar */
  //CURRENT OBSERVATIONS:
  //  shows empty selection state for commands (ctrl + z)
  //  Tab exits the editor
  //  does show a selection state for bold/italic button click
  handleEditorChange = (editorState) => {

    let stringState = convertToRaw(this.props.editorState.getCurrentContent());
    stringState = JSON.stringify(stringState);
    console.log('before save\n', stringState);
    // debugger;
    this.props.socket.emit('update-document',
    { docID: this.props.currDOC, state: stringState, title: this.props.title},
    ({ success }) => {
      console.log('success?!', success);
    });
    this.props.updateEditor(editorState);
  }


  handleKeyCommand = (command: string): DraftHandleValue => {
    if (command === 'bold') {
      const newEditorState = styles.fontWeight.toggle(this.props.editorState, 'bold');
      this.handleEditorChange(newEditorState);
    }
    if (command === 'italic') {
      const newEditorState = styles.fontStyle.toggle(this.props.editorState, 'italic');
      this.handleEditorChange(newEditorState);
    }
    if (command === 'underline') {
      const newEditorState = styles.textDecoration.toggle(this.props.editorState, 'underline');
      this.handleEditorChange(newEditorState);
    }
    return 'not-handled';
  }

  saveDoc() {
    let stringState = convertToRaw(this.props.editorState.getCurrentContent());
    stringState = JSON.stringify(stringState);
    // debugger;
    this.props.socket.emit('save-document',
    { docID: this.props.currDOC, state: stringState, title: this.props.title},
    ({ success }) => {
      console.log('success?!', success);
    });
  }

  //Move up from Doc to User home page
  leaveDoc() {
    let stringState = convertToRaw(this.props.editorState.getCurrentContent());
    stringState = JSON.stringify(stringState);
    // debugger;
    this.props.socket.emit('leave-document',
    { docID: this.props.currDOC, state: stringState, title: this.props.title },
    ({ success }) => {
      if(success === true){
        this.props.leaveDoc();
      }else{
        console.log(success);
      }
      console.log('hello darkness my old friend')
    });
  }

  updateDoc() {

  }

  render() {
    return (<div id='content'>
      <div style={{'display': 'flex', 'alignItems': 'center', 'justifyContent': 'space-between'}}>
        <TextField hintText={this.props.title}
                  underlineShow={false}
                  style={{'fontSize': '20px'}}
                  hintStyle={{'fontStyle': 'italic'}}
                  onChange={(e)=>this.props.updateTitle(e.target.value)}
        />

        <div>
          <RaisedButton
            label="Share"
            onClick={(e) => {
              e.preventDefault();
              alert(`Share this code to provide access to your document: ${this.props.currDOC}`)
            }}
          />
          <RaisedButton label="Save"
            primary={true}
            onClick={(e) => {
              e.preventDefault();
              this.saveDoc();
            }}
          />
          <RaisedButton
            backgroundColor="#a4c639"
            icon={<Home />}
            onClick={(e) => {
              e.preventDefault();
              this.leaveDoc();
            }}
          />
        </div>
      </div>
      <Paper zDepth={2} transitionEnabled={false}>
            <Textbar
                updateEditor={this.props.updateEditor}
                editorState={this.props.editorState}
            />
        <Editor className='editor'
                editorState={this.props.editorState}
                onChange={this.handleEditorChange}
                spellCheck={true}
                ref='editor'
                customStyleFn={customStyleFn}
                customStyleMap={customStyleMap}
                handleKeyCommand={this.handleKeyCommand}
                keyBindingFn={myKeyBindingFn}
                // plugins={plugins}
                blockStyleFn={blockStyleFn}
            />
      </Paper>
    </div>);
  }
}

TextEditor.propTypes = {
  joinDoc: PropTypes.func,
};


const mapStateToProps = ({ currDOC, room, loggedIn, userID, socket, title }) => ({
  currDOC, room, loggedIn, userID, socket, title
});

const mapStateToDispatch = dispatch => ({
  updateTitle: title => dispatch({type: 'UPDATE_TITLE', title })
  // joinDoc: (room, state, docID) => dispatch({ type: 'JOIN_DOC', room, state, docID }),
});

export default connect(mapStateToProps, mapStateToDispatch)(TextEditor);
