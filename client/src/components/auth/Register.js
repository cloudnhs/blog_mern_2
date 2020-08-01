import React, {Component} from 'react';

class Register extends Component {
    render() {
        return (
            <div className={"register"}>
                <div className={"container"}>
                    <div className={"row"}>
                        <div className={"col-md-8 m-auto"}>
                            <h1 className="display-4 text-center">Sign up</h1>
                            <p className={"lead text-center"}>
                                Create your DevWilliamConnector account
                            </p>

                            <form>
                                <div className={"form-group"}>
                                    <input
                                        type={"text"}
                                        className={"form-control form-control-lg"}
                                        placeholder={"Name"}
                                    />
                                </div>

                                <div className={"form-group"}>
                                    <input
                                        type={"text"}
                                        className={"form-control form-control-lg"}
                                        placeholder={"Email Address"}
                                    />
                                    <small className={"form-text text-muted"}>
                                        This site uses Gravatar so if you want a profile image, use a Gravatar email
                                    </small>
                                </div>

                                <div className={"form-group"}>
                                    <input
                                        type={"text"}
                                        className={"form-control form-control-lg"}
                                        placeholder={"Password"}
                                    />
                                </div>

                                <div className={"form-group"}>
                                    <input
                                        type={"text"}
                                        className={"form-control form-control-lg"}
                                        placeholder={"Confirm Password"}
                                    />
                                </div>
                                <input
                                    type="submit"
                                    className={"btn btn-info btn-block mt-4"}
                                />
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Register;