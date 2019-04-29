# Project Hooter Skill
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

# Hooter Owl
Hooter Owl has several different intents. Distance, directions, hours, events, and news. Each of these intents help run the skill. To use Hooter Owl simply say, "Open Hooter Owl" or "ask hooter owl...". 

## Directions Intent
Hooter can be used as a GPS! He can give you specific step by step instructions on how to get to and from any building on campus, your location, or any specific street address. Simply ask Hooter, "how do I get to {building}", or "take me to {building} from {building}" You can replace {building} in your speech with {street address}.

## Distance Intent
You can ask Hooter, "how far is {building} from me" or "how long will it take to get to {building} from {building}. Hooter will respond with the minutes away a building is from your location or another location. You can ask for the distance to and from your location, another building on campus or any specific street address. Again, you can replace {building} in your speech with {street address}.

## Canvas To Do Intent
Hooter has the capability to retrieve the user's "to do list" from their Canvas account (https://www.canvaslms.com/) and read it out to the user, listing the assignments that are due. __However__, Temple University's policy prevents access to a user's Canvas account without the use of third party authentication, which we are unable to get permission to do. This intent will be disabled in the public version of Hooter skill.

## Event Lookup Intent
Hooter has access to several different calendars. Hooter has access to the academic calendar, the Temple athletics calendar, and the Phillies and Eagles' calendars. You can ask Hooter something like "what are the upcoming events" or "events on {day}". Hooter will respond with 1-5 events and when they are occurring and how many days are remaining until the event. 

## Hours Lookup Intent
Hooter has access to the hours that each building is open and closed on each day of the week. You can ask Hooter if a building is open on a certain day or for the hours of a building.

## News Intent
Hooter can get you headlines fresh from Temple University's News. You can access them by saying "get me today's headlines" or "what's new in {newsType}". Different news types include: arts and culture, athletics, campus, research, students, sustainability, staff, community, and more. Hooter has lots of Temple pride and only delivers news related to Temple University. Go Owls!

# Individual Contributions

## Viet Pham
I spent most of the time working on Events Lookup and Temple Buildings Hours Lookup Intents. In order to start working on these two intents, I had to do research on how to use Alexa SDK, Node.js, DynamoDB, and AWS Lambda. I also learned how to use API Gateway to create a REST API that can access the database and return the proper building's information. This step is very beneficial since we do not need to use complicated syntax to access the database but make an API call within the code. Plus, other intents of Myra Mirza also get the benefit from the API when she uses it to retrieve the building's address. Besides developing intents, I also did a lot of testing to look for unknown errors that we did not expect.  

## Myra Mirza
From start till end research was an important part of development. The things I had to research on were: how to set up a skill on the Alexa Developer Console, how AWS Lambda would host our backend, how to set up DynamoDB with our data, and how to connect our backend with the database. I later researched on using the Alexa Skills Kit SDK and how to interact with different Google and Alexa APIs. I created the Directions, Distance, and Temple University News intents. I configured the intents on the Alexa Developer Console to set up the front end for these intents. I added utterances, which are things the user would say to request information and created specific slot values in those utterances so my backend code could extract the values it required from the user to perform the requested intent. For the Distance and Directions intents, I utilised several different APIs to obtain the information the user required. In my code I used: the Google Distance Matrix API, the Google Directions API, the Google Geocoding API and the Alexa Device Address API. My code for the Distance and Directions intent also retrieves information from our DynamoDB database which stores information about the different buildings on and around campus. For making API calls and retrieving information from the database I used the Axios library. I tested my code throughout the development phase to improve handling different use cases and errors. 


## Sean Reddington
My contributions mostly revolved around the Canvas to do list Intent. In order to create this intent I had to research and learn how to use the Alexa Skill kit, json web tokens (JWT), the Canvas LMS API (https://canvas.instructure.com/doc/api/index.html) and the Axios library (https://github.com/axios/axios). I also worked on restructuring the project directory, which allowed us to work on code outside of the Alexa skill console. This was a very nesseccary improvement to the project because it let us work individually on our portions of the code using node.js with our own machines and allowed us to use the github repository as a group as well. finally, I worked on a new vectorized version of the Hooter skill icon using Adobe Illustrator, which allowed us to make multiple sized icons.

## Richard Kemmerer
Before we began the project, I had to understand DynamoDB and the Lambda function. I added Temple events and the academic calendar to the Google Calendar. I also added the Phillies, Eagles, and Temple sports calendars since many students at Temple enjoy going to sports games. I added utterances for the distance and directions intent. I had to add the building database to DynamoDB. DynamoDB is on Amazon’s website. I looked up hours and addresses for 43 buildings and added them to an excel file. Then I coded them in JSON on DynamoDB. In addition to this I also added synonyms to each of the buildings. This is useful because some buildings have multiple names and everyone does not call each building the same thing. I also added building name values to slots. We all had to prepare the subject presentation. I added about half of the slides and found a lot of different information through online sources. Sean and I designed the logo for our skill. I came up with the main concept and draft version and he edited and finalized it. Finally, we all had to update the ReadMe, Trello, and merge the code for the final demo. I also tested all the buildings and how they worked with each of the intents.
