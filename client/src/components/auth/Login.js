import React, { Component } from "react";
import PropTypes from "prop-types";
import { loginUser } from "../../actions/authActions";
import { connect } from "react-redux";
import TextFieldGroup from "../common/TextFieldGroup";

class Login extends Component {
  state = {
    email: "",
    password: "",
    errors: {}
  };

  componentWillMount() {
    if (this.props.auth.isAuth) {
      this.props.history.push("/dashboard");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuth) {
      this.props.history.push("/dashboard");
    }
    if (nextProps) {
      this.setState({ errors: nextProps.errors });
    }
  }

  onChange = event => {
    this.setState({
      [event.target.name]: event.target.value
    });
  };
  onSubmit = e => {
    e.preventDefault();
    const User = {
      email: this.state.email,
      password: this.state.password
    };
    this.props.loginUser(User);
  };
  render() {
    const { errors } = this.state;
    return (
      <div className="register">
        <div className="container">
          <div className="row">
            <div className="col-md-8 m-auto">
              <h1 className="display-4 text-center">Log In</h1>
              <p className="lead text-center">
                Sign in to your DevConnector account
              </p>
              <form onSubmit={this.onSubmit}>
                <TextFieldGroup
                  placeholder="Email Address"
                  name="email"
                  value={this.state.email}
                  onChange={this.onChange}
                  error={errors.email}
                  type="text"
                />
                <TextFieldGroup
                  placeholder="Password"
                  name="password"
                  value={this.state.password}
                  onChange={this.onChange}
                  error={errors.password}
                  type="password"
                />
                <input type="submit" className="btn btn-info btn-block mt-4" />
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired
};
const mapStateToProps = state => {
  return {
    auth: state.auth,
    errors: state.errors
  };
};

export default connect(
  mapStateToProps,
  { loginUser }
)(Login);
