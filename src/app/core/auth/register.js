// react
import React, { Component } from 'react';
import { Link } from 'react-router-dom';

// app
import firebase from './../../../firebase';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import SlackLogo from '../../../assets/svg/general/slack-logo.svg';
import LoadingAnimation from './../../utilities/loading-animation/loading-animation';

class Register extends Component {
    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirm: '',
        errors: [],
        isFormEnabled: false,
        isAccountCreated: false,
        isAnimationLoading: false
    };

    render() {
        const {username, email, password, passwordConfirm, errors, isFormEnabled, isAccountCreated, isAnimationLoading} = this.state;

        // loading animation
        if (isAnimationLoading) {
            return <LoadingAnimation/>
        }

        const content = () => {
            switch(isAccountCreated) {
                case false:
                    return (
                        <section className="cd-col sc-form">
                            {
                                errors && errors.length > 0 && (
                                    /* Errors */
                                    <p className="cd-error">{this.displayErrors(errors)}</p>
                                )
                            }
                            <form className="sc-form-fields" onSubmit={this.handleSubmit}>
                                <FormControl className="sc-form-field" fullWidth>
                                    <InputLabel htmlFor="username">Username</InputLabel>
                                    <Input id="username" name="username" value={username} onChange={this.handleChange}/>
                                </FormControl>
                                <FormControl className="sc-form-field" fullWidth>
                                    <InputLabel htmlFor="email">Email</InputLabel>
                                    <Input id="email"
                                           name="email"
                                           value={email}
                                           error={this.handleInputError(errors, 'email')}
                                           onChange={this.handleChange}/>
                                </FormControl>
                                <FormControl className="sc-form-field" fullWidth>
                                    <InputLabel htmlFor="password">Password</InputLabel>
                                    <Input id="password" name="password" type="password" value={password} onChange={this.handleChange}/>
                                </FormControl>
                                <FormControl className="sc-form-field" fullWidth>
                                    <InputLabel htmlFor="passwordConfirm">Password Confirm</InputLabel>
                                    <Input id="passwordConfirm" name="passwordConfirm" type="password" value={passwordConfirm}
                                           onChange={this.handleChange}/>
                                </FormControl>
                                <Button className="sc-button"
                                        variant="contained"
                                        type="submit"
                                        disabled={!isFormEnabled}
                                        fullWidth>
                                    Sign Up
                                </Button>
                            </form>
                        </section>
                    );
                default:
                    return (
                        <section className="cd-col sc-message">
                            <p>Your account has been created successfully!</p>
                            <p>Your are automatically redirecting back to the login page shortly!</p>
                        </section>
                    );
            }
        };

        return (
            <section className="sc-register">
                <div className="cd-row">
                    {/* Header */}
                    <header className="sc-header">
                        <img src={SlackLogo} alt="slack-logo" />
                    </header>

                    {
                        /* Form | Success Message */
                        content()
                    }

                    {/* Footer */}
                    <footer className="cd-col sc-link">
                        <p>Already a user? <Link className="cd-link" to="/login">Login</Link></p>
                    </footer>
                </div>
            </section>
        );
    }

    /**
     * handle input change event
     *
     * @param event
     */
    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value}, () => {
            // remove errors
            if (this.state.errors && this.state.errors.length > 0) {
                this.setState({errors: null});
            }

            // validate form
            this.setState({isFormEnabled: this.isFormValid()});
        });
    };

    /**
     * handle form submit event
     *
     * @param event
     */
    handleSubmit = (event) => {
        // stop default event
        event.preventDefault();

        // show loading animation
        this.setState({isAnimationLoading: true});

        // register user
        firebase
            .auth()
            .createUserWithEmailAndPassword(this.state.email, this.state.password)
            .then(() => {
                // remove errors, show success message, remove loading animation
                this.setState({errors: null, isAccountCreated: true, isAnimationLoading: false});

                // redirect to login page.
                setTimeout(() => {
                    this.props.history.push('/login');
                }, 4000);
            })
            .catch((error) => {
                // add errors
                this.setState({errors: [error], isAnimationLoading: false});
            });
    };

    /**
     * check form validation
     *
     * @returns {boolean}
     */
    isFormValid = () => {
        if (this.isFormEmpty(this.state)) {
            return false;
        } else if (!this.isEmailValid(this.state.email)) {
            return false;
        } else {
            return this.isPasswordValid(this.state);
        }
    };

    /**
     * check whether form is empty or not
     *
     * @param username
     * @param email
     * @param password
     * @param passwordConfirm
     * @returns {boolean}
     */
    isFormEmpty = ({username, email, password, passwordConfirm}) => {
        return !username.length || !email.length || !password.length || !passwordConfirm.length;
    };

    /**
     * check email validity
     *
     * @param email
     */
    isEmailValid = (email) => {
        return /\S+@\S+\.\S+/.test(email);
    };

    /**
     * check password validity
     *
     * @param password
     * @param passwordConfirm
     */
    isPasswordValid = ({password, passwordConfirm}) => {
        if (password.length < 6 || passwordConfirm.length < 6) {
            return false;
        } else {
            return password === passwordConfirm;
        }
    };

    /**
     * display errors
     *
     * @param errors
     * @returns {*}
     */
    displayErrors = (errors) => errors.map((error, i) => <span key={i}>{error.message}</span>);

    /**
     * handle Input Error
     *
     * @param errors
     * @param fieldName
     * @returns {*|boolean}
     */
    handleInputError = (errors, fieldName) => {
        return (
            errors && errors.some(
                error => error.message.toLocaleLowerCase().includes(fieldName)
            )
        );
    };
}

export default Register;
