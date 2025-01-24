We want to move the state up in the application and when we fetch all project sites, we also want to fetch all of their weather data, and render the projects in the project list and compile all alerts into the alert list 

Then when users create a new project site, we want to fetch the weather data for that site and render it in the project list and alert list query the natoinal weather noaa from the front end and save that to that weather database on demand so, there are two ways to save weather data, cron job and on demand 

on load get all projectrs all weather and initialise the weather context with that data 

when you a user clicks and opens a project site we want to update the existing prject site weather data so we have the most up to date weather data  also if a user edits a project site, ensure that the corresponding weather data stays attached to it also when a user deleted a project site, ensure that the corresponding weather data is deleted 

rearrange the front end weather fetch call until after the onclick for project site list handles fast travel to project site 