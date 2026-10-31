# Application Sitemap

Development base URL: `http://localhost:3000/`

All routes below require authentication except `/login`. Dynamic route parameters
such as `:eventId`, `:spotlightId`, and `:id` are placeholders and must be
replaced with actual IDs.

```text
/
└── /login                                      Sign in

Authenticated application
├── /dashboard                                  Dashboard
├── /about                                      About
├── /announcements                              Announcements
├── /donations                                  Donations
├── /events                                     Events list
│   ├── /events?view=calendar                   Events calendar view
│   └── /events/:eventId                        Event details
├── /teachers                                   Teacher profiles
├── /spotlights                                 Teacher spotlights
│   └── /spotlights/:spotlightId                Spotlight details
├── /profile                                    Profile
├── /profile/me                                 My profile
├── /profile/new                                Create profile
├── /profile/view/:id                           Alumni profile
├── /stats                                      Statistics
├── /membership-request                         Membership requests
├── /admin                                      Admin management
├── /data/dynamicdata                           Dynamic data management
└── /dynamicdata                                Dynamic data management (alias)
```

The `/` path and any unmatched path redirect to `/login`.