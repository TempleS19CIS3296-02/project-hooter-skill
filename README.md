# project-hooter-skill
project-hooter-skill created by GitHub Classroom

![](https://github.com/TempleS19CIS3296-02/project-hooter-skill/blob/master/icons/icon_solid_108.png)

# Team Members

Viet Pham

Myra Mirza

Sean Reddington

Richard Kemmerer

# Project Abstract
Our project is to create an Alexa skill that can provide information about Temple University, such as building location, open hours, and academic schedule. Users can just simply ask "Hey Hooter, what time does IBC close today?", the skill will get the information from the database stored on Amazon Web Service and answer to users. The database will be continuously updated, unlike Google result's hours, which might not be correct during different holidays.

# Expectations for team members
Everyone will partcipate in the assignment. We will all meet up as a group and work together about once a week. We will all have various tasks to do on Trello and Github. We will all write code, edit the readMe, and have fun.

# Project Relevance
The project is linked with several educational goals that are introduced in class, such as remote procedure calls and access to the database. Basically, when the user asks Alexa to activate skill "Hooter", it will search in the remote skill database and launch the skill with matching name. Also, all the data that the skill uses is also stored in a web server, so data accessing will be used. These are important goals because these two capabilities are commonly used in today applications.
We are already familiar with Trello, Github, API, and Java. We have to learn more about Amazon skill and lambda functions.

# Trello board
https://trello.com/b/2qKPEsmw/hooter-skill-final-project

# Goals and Milestones
One milestone that we have is to connect the database to our lambda function. Another milestone we have is to gain permission from Temple ITS department to grant us developer access to Canvas and its API. One goal we have is to provide building times and locations to Temple students. Another goal is to, help students lookup events that are happening on campus and in the academic calendar. We want to provide login ability for Canvas accounts.
The Software Development Process that we are using is plan driven. We are not testing as much and we are looking up resources to achieve our goals and milestones. We will be giving in class presentation on April 19th about Alexa skill.

# Hooter Skill
Hooter skill has several different intents. Distance, directions, hours, events, and news. Each of these intents help run the skill. To use Hooter skill simply say, "Open Hooter Skill" or "ask hooter skil...". 

# Directions
Hooter can be used as a GPS! He can give you specific step by step instructions on how to get to any building on campus from your location or another building on campus. Simply ask Hooter, "how do I get to {building}".

# Distance
You can ask Hooter, "how far is {building} from me" or "how many minutes away is {building} from me. Hooter will respond with the minutes away a building is from your location or another location.

# Event Lookup
Hooter has access to several different calendars. Hooter has access to the academic calendar, the Temple athletics calendar, and the Phillies and Eagles' calendars. You can ask Hooter something like "what are the upcoming events" or "events on {day}". Hooter will respond with 1-5 events and when they are occurring and how many days are remaining until the event. 

# Hours Lookup
Hooter has access to the hours that each building is open and closed on each day of the week. You can ask Hooter if a building is open on a certain day or for the hours of a building.

# News 
Hooter has access to Temple News Headlines. You can access them by saying "what are today's headlines" or "what's new in {newsType}". Different news types include, the arts, athletics, staff, community, and more. Hooter only has access to Temple news related things.

# Individual Contributions

# Viet Pham

# Myra Mirza

# Sean Reddington

# Richard Kemmerer
Before we began the project, I had to understand DynamoDB and the Lambda function. I added Temple events and the academic calendar to the Google Calendar. I also added the Phillies, Eagles, and Temple sports calendars since many students at Temple enjoy going to sports games. I added utterances for the distance and directions intent. I had to add the building database to DynamoDB. DynamoDB is on Amazon’s website. I looked up hours and addresses for 43 buildings and added them to an excel file. Then I coded them in JSON on DynamoDB. In addition to this I also added synonyms to each of the buildings. This is useful because some buildings have multiple names and everyone does not call each building the same thing. I also added building name values to slots. We all had to prepare the subject presentation. I added about half of the slides and found a lot of different information through online sources. Sean and I designed the logo for our skill. I came up with the main concept and draft version and he edited and finalized it. Finally, we all had to update the ReadMe, Trello, and merge the code for the final demo. I also tested all the buildings and how they worked with each of the intents.
