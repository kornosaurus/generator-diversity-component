<%= componentTitle %>
===================

## Register the component to api.diversity.io

    curl -X POST -d repo_url=https://git.diversity.io/<%= componentName %>/<%= componentName %>.git api.diversity.io/components/<%= componentName %>/register

Change the `repo_url` to the place where you are hosting your component.

Set up a web hook on tag push events: 

    api.diversity.io/components/<%= componentName %>/update
