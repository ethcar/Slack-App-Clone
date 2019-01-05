// react
import React, { Component } from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';

// redux
import { connect } from 'react-redux';

// firebase
import firebase from '../firebase';

// app
import Login from './system/core/auth/Login';
import Register from './system/core/auth/Register';
import Home from './system/frame/home/Home';
import Chat from './system/core/chat/Chat';
import ENV from '../environment/index';
import { setUser, updateUserStatus, updateUserColors, clearUser, updateUserStarred } from './store/actions/UserAction';
import LoadingAnimation from './system/utilities/loading-animation/LoadingAnimation';

class AppRouter extends Component {
	componentDidMount() {
		// redirect to the chat route on user logged-in state
		firebase
			.auth()
			.onAuthStateChanged((user) => {
				if (user) {
					if (user.displayName) {
						// real-time database user
						firebase
							.database()
							.ref(`users/${user.uid}`)
							.once('value')
							.then((snap) => {
								const snapshot = snap.val();
								if (snapshot) {
									// set state: user
									this.props.setUser(user);

									// set state: user status
									const status = snapshot.code ? snapshot.code : '1';
									this.props.updateUserStatus(status);

									// set state: user stars
									const starred = snapshot.starred ? Object.values(snapshot.starred) : [];
									this.props.updateUserStarred(starred);

									// set state: user colors
									const initColors = {
										background: {
											primary: '',
											secondary: ''
										},
										color_primary: '',
										color_secondary: ''
									};
									const colors = snapshot.colors ? snapshot.colors : initColors;
									this.props.updateUserColors(colors);

									// navigate to chat route
									if (this.props.location.pathname !== ENV.ROUTING.CHAT) {
										this.props.history.push(ENV.ROUTING.CHAT);
									}
								}
							});
					}
				} else {
					// navigate to home route
					this.props.history.push(ENV.ROUTING.HOME);

					// clear user from store
					this.props.clearUser();
				}
			});
	}

	render() {
		const { isAnimationLoading } = this.props;
		return isAnimationLoading ? <LoadingAnimation/> : (
			<Switch>
				<Route exact path={ENV.ROUTING.HOME} component={Home}/>
				<Route path={ENV.ROUTING.AUTH.LOGIN} component={Login}/>
				<Route path={ENV.ROUTING.AUTH.REGISTER} component={Register}/>
				<Route path={ENV.ROUTING.CHAT} component={Chat}/>
			</Switch>
		);
	}
}

// props
const mapStateFromProps = state => ({
	isAnimationLoading: state.user.isAnimationLoading
});

export default withRouter(
	connect(
		mapStateFromProps,
		{ setUser, updateUserStatus, updateUserColors, updateUserStarred, clearUser }
	)(AppRouter)
);
