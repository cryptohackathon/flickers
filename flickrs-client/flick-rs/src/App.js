import './App.css';

import React from "react";

// import { Col, Row } from 'react-bootstrap';
import ImageList from './image_list';
import Registration from './registration';
import Upload from './upload';
import { Col, Row } from 'react-bootstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isRegistered: false,
      imgs: [],
      wasm: null,
      gid: null,
      attrs: [],
      selected_attrs: [],
      interested_attrs: [],
      registration_key: null,
      server_key: null,
      total_attrs: null,
    };

    this.onRegistration = this.onRegistration.bind(this);
    this.getImages = this.getImages.bind(this);
  }

  componentDidMount() {
    this.loadWasm();
    this.serverSetup();
    this.loadAttrs();
  }

  async loadWasm() {
    try {
      const wasm = await import('flick-rs-wasm');
      this.setState({ wasm });
    } catch (err) {
      console.error(`Unexpected error in loadWasm. [Message: ${err.message}]`);
    }
  };

  serverSetup() {
    fetch("/api/setup", { method: "GET" })
      .then(response => response.json())
      .then(data => this.setState({ server_key: data["server_key"] }));
  }

  loadAttrs() {
    fetch("/api/attributes", { method: "GET" })
      .then(response => response.json())
      .then(data => {
        this.setState({ total_attrs: data["attributes"].length })
      });
  }

  getImage(id) {
    const api_str = "/api/" + id;
    console.log(api_str);
    fetch(api_str, { method: "GET" })
      .then(response => {
        console.log(response);
        return response.json();
      })
      .then(data => {
        console.log(data["image"]);

        this.setState(state => {
          state.imgs.push(data["image"]);
          const imgs = state.imgs;
          return {
            imgs
          };
        })
      })
  }

  getImages() {
    // Get the images, better would be one by one.
    fetch('/api/images_list', { method: "GET" })
      .then(response => response.json())
      .then(data => {
        data["ids"].forEach(id => {
          this.getImage(id);
        });
      });
  }

  /// Is called by the Registration component
  onRegistration(gid, attrs, key) {
    this.setState({
      isRegistered: true,
      gid: gid,
      interested_attrs: attrs.map(x => parseInt(x) - 1),
      registration_key: key,
    });

    // TODO: just for now to display something.
    this.getImages();
  }

  render() {
    console.log(this.state);

    const {
      wasm,
      attrs,
      server_key,
      selected_attrs,
      total_attrs,
    } = this.state;

    if (this.state.isRegistered) {
      const {
        imgs,
        registration_key,
        interested_attrs,
        gid,
      } = this.state;

      return imgs && wasm && registration_key && gid && attrs && (
        <React.Fragment>
          <Upload wasm={wasm} server_key={server_key} selected_attrs={selected_attrs} total_attrs={total_attrs}></Upload>
          <ImageList
            wasm={wasm}
            upk={registration_key}
            av={interested_attrs}
            gid={gid}
            attributes={total_attrs}
            imgs={imgs}
          ></ImageList>
        </React.Fragment>
      );
    } else {
      return wasm && server_key && selected_attrs && total_attrs && (
        <React.Fragment>
          <Registration onRegistration={this.onRegistration}></Registration>
          <Upload
            wasm={wasm}
            server_key={server_key}
            selected_attrs={selected_attrs}
            total_attrs={total_attrs}
          ></Upload>
        </React.Fragment>
      );
    }
  }
}

export default App;
