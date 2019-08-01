import React, { Component } from "react";
import { connect } from "react-redux";
import { push } from "redux-first-routing";
import IPageInterface from "../utils/IPageInterface";
import "../global.css";
import { IState } from "../store/schools/types";
import { IState as UserSettingsIState } from "../store/usersettings/types";
import School from "../@types/school";
import Link from "../components/Link";
import { pages } from "../utils/constants";
import Icon from "../components/Icon";
import { URLs } from "../utils/constants";
import { setTimeFormatPreference } from "../store/usersettings/actions";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGithub, faTwitter, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { faHome, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useAuth0 } from "../react-auth0-wrapper";
import distanceInWordsToNow from "date-fns/distance_in_words_to_now";
import { selectSchool } from "../store/schools/actions";

export interface ISettingProps {
    selectedSchool: any;
    userSettings: { use24HourTime: boolean }; //this is duplicated. ugh
    dispatch: any;
}

const Settings = (props: ISettingProps) => {
    const { logout, user, getTokenSilently } = useAuth0();

    const navigate = (to: string) => {
        props.dispatch(push(to));
    };

    const refreshSchedule = async () => {
        const token = await getTokenSilently;
        if (token === undefined) {
            props.dispatch(
                selectSchool(token, props.selectedSchool.data.getIdentifier())
            );
        }
    };

    return (
        <div>
            <Link
                className="cornerNavButton smallIcon"
                // tslint:disable-next-line: jsx-no-lambda
                destination={() => navigate(pages.main)}
            >
                <FontAwesomeIcon icon={faHome} />
            </Link>
            <br />

            <h1>Settings</h1>
            {user ? (
                <span>
                    Hello <b>{user.name || user.email}</b>,
                </span>
            ) : (
                undefined
            )}
            <br />
            <Link
                // tslint:disable-next-line: jsx-no-lambda
                destination={() => logout()}
                title="Log Out"
            >
                <FontAwesomeIcon icon={faSignOutAlt} /> Log Out
            </Link>
            <h2>Selected School:</h2>
            <p>
                <br />
                {props.selectedSchool.isFetching ? (
                    <p>Loading School...</p>
                ) : (
                    <b>{props.selectedSchool.data.getName() + " "}</b>
                )}
                <em className="smallerText">
                    (
                    <Link
                        // tslint:disable-next-line: jsx-no-lambda
                        destination={() => navigate(pages.selectSchool)}
                        title="Change School"
                    >
                        Change School
                    </Link>
                    )
                </em>
                <br />
                <em className="smallerText">
                    Last Updated:{" "}
                    {distanceInWordsToNow(
                        new Date(props.selectedSchool.lastUpdated).toString(),
                        { addSuffix: true }
                    ) + " "}
                </em>
                <em className="smallerText">
                    (
                    <Link
                        // tslint:disable-next-line: jsx-no-lambda
                        destination={refreshSchedule}
                        title="Reload Schedule"
                    >
                        Refresh
                    </Link>
                    )
                </em>
            </p>
            <label>
                <b>Use 24-hour Time?</b>{" "}
                <input
                    type="checkbox"
                    checked={props.userSettings.use24HourTime}
                    // tslint:disable-next-line: jsx-no-lambda
                    onChange={() => {
                        props.dispatch(
                            setTimeFormatPreference(!props.userSettings.use24HourTime)
                        );
                    }}
                />
            </label>
            <br />
            <p>
                <em className="smallerText">
                    Settings are automatically saved on your device
                </em>
            </p>

            <p style={{ marginTop: "20vh" }}>Follow ClassClock:</p>
            <ul className="footer__social">
                <li>
                    <Link destination={URLs.github}>
                        <FontAwesomeIcon icon={faGithub} />
                    </Link>
                </li>
                <li>
                    <Link destination={URLs.twitter}>
                        <FontAwesomeIcon icon={faTwitter} />
                    </Link>
                </li>
                <li>
                    <Link destination={URLs.instagram}>
                        <FontAwesomeIcon icon={faInstagram} />
                    </Link>
                </li>
            </ul>
            <p id="credits">
                Created by: <a href="https://www.adriancedwards.com">Adrian Edwards</a>{" "}
                and <a href="https://nbdeg.com/">Nick DeGroot</a>
                <br />
                Idea by: <a href="https://twitter.com/MrKumprey">Dan Kumprey</a>
            </p>
        </div>
    );
};

const mapStateToProps = (state: IState & UserSettingsIState) => {
    const { selectedSchool, userSettings } = state;
    return {
        selectedSchool: Object.assign({}, selectedSchool, {
            data: School.fromJson(selectedSchool.data)
        }),
        userSettings
    };
};

export default connect(mapStateToProps)(Settings);
