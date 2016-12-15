
License
============

<a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">
  <img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-sa/4.0/88x31.png" />
</a>
<br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-sa/4.0/">Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License</a>.
<br />
Based on a work at <a xmlns:dct="http://purl.org/dc/terms/" href="https://github.com/murphd37/FlightClub" rel="dct:source">https://github.com/murphd37/FlightClubClient</a>.

Flight Club
============

Flight Club is a rocket launch and landing trajectory simulator. 

Built upon a RESTful API, Flight Club takes an input of Burns and Course Corrections
and spits out telemetry data for each stage of the vehicle's trajectory. 

Flight Club was originally built to prettify the C Launch code I had already written for the same purpose.
It then served as a way to teach myself Java and SQL, and later web-design including front end frameworks such as jQuery. 
(See the server side <a href="https://github.com/murphd37/FlightClub">here</a>. Note: server side code is not publicly accessible.) It has since evolved into a fully-fledged launch simulator utilised by online space enthusiasts, journalists and even brokerage firms.

This app is live at <http://www.flightclub.io>

Watching Live
==============

Any simulated launch trajectory can be plotted in real-time alongside the actual launch. 
Before liftoff, LiveLaunch provides a countdown clock to the moment of launch. During the mission, 
it plots the trajectories of the booster stages from launch to landing, highlighting all engine 
restarts and cut-offs, and plots the trajectory of the upper stage from launch to orbit. 
LiveLaunch also provides a continuously updating print-out of altitude and velocity for the both stages.

Originally planned for launch (no pun intended) for the Orbcomm OG2-2 mission, the Flight Club server 
was down within 30s of posting it to reddit.com/r/spacex. Let's hope the Jason-3 mission brings me more luck.

Contact
============

I can be reached by mail at murphd37@tcd.ie
