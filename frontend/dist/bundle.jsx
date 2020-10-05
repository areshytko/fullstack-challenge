'use strict';

/**
 * @fileoverview Contains all frontend functionality
 * Is assumed to included as-is to the html page. 
 * @todo refactor it into separate modules and use proper bundler.
 * @todo AUTHENTICATION_URL should be provided from the build environment
 */

/**
 * URL of authentication service. This is a development mock implementation
 */
const AUTHENTICATION_URL = '/login?returnTo=/';

const App = () => {
    const [reports, setReports] = React.useState([]);

    window.reports = reports;

    React.useEffect(() => {

        setAuthentication(AUTHENTICATION_URL);

        const fetchData = async () => {
            const result = await axios.get('/reports');
            if (result.data.payload) {
                setReports(result.data.payload);
            }
            else {
                console.log("Errorneous response", result);
            }
        };

        fetchData();
    }, []);


    const blockReport = async (reportId) => {
        const result = await axios.put('/reports/' + reportId, { ticketState: 'BLOCKED' });
        if (result.status === 200) {
            setReports(reports.map(report => (report.reportId != reportId) ? report : Object.assign({}, report, { state: 'BLOCKED' })));
        }
    };

    const resolveReport = async (reportId) => {
        const result = await axios.put('/reports/' + reportId, { ticketState: 'RESOLVED' });
        if (result.status === 200) {
            setReports(reports.filter(report => report.reportId != reportId));
        }
    };

    return (
        <ReportsList reports={reports} handleBlock={blockReport} handleResolve={resolveReport} />
    );
};

const ReportsList = (props) => {
    return (
        <div className="app-container">
            {props.reports.map((report, key) =>
                <Report
                    report={report}
                    key={key}
                    handleBlock={() => props.handleBlock(report.reportId)}
                    handleResolve={() => props.handleResolve(report.reportId)}
                />
            )}
        </div>
    );
};

const Report = (props) => {
    return (
        <div className="report">
            <div className="left-col">
                <div style={{ fontSize: "8px" }}>Id: {props.report.reportId}</div>
                <div>State: {props.report.state}</div>
                <button className="link">Details</button>
            </div>
            <div className="middle-col">
                <div>Type: {props.report.reportType}</div>
                <div>Message: {props.report.message}</div>
            </div>
            <div className="right-col">
                <button className="resolve-button" onClick={props.handleBlock}>Block</button>
                <button className="resolve-button" onClick={props.handleResolve}>Resolve</button>
            </div>
        </div>
    );
};


/**
 * Initialization functions that sets redirect to authentication service
 * and constructs proper headers from the authentication results.
 * @param {string} authenticationUrl - url to the authentication service (it is assumed it is on the same domain)
 */
const setAuthentication = (authenticationUrl) => {

    axios.interceptors.response.use((response) => {
        return response;
    }, (error) => {
        if (error.response && error.response.status == '401') {
            redirect(authenticationUrl, 'post');
        }
        else {
            return Promise.reject(error);
        }
    });

    const token = readCookie('jwt');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
};

/**
 * Parse and return cookie
 * @param {string} name cookie name
 */
const readCookie = (name) => {
    const prefix = `${name}=`;
    for (let c of document.cookie.split(';')) {
        c = c.trim();
        if (c.indexOf(prefix) == 0) {
            return c.substring(prefix.length, c.length);
        }
    }
    return null;
}

/**
 * redirect to the given url
 * @param {string} url url redirect to
 * @param {string} method http method
 */
const redirect = (url, method) => {
    const form = document.createElement('form');
    form.method = method;
    form.action = url;
    document.body.appendChild(form);
    form.submit();
};
