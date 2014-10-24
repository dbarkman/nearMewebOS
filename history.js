/*
 * Version 1.3.1 - 06/24/2010
 *   1. Minor increment for Palm App submission, no code change
 * Version 1.3 - 06/21/2010 - 06/24/2010
 *   1. Added feature for adding a Place to Contacts
 *   2. Added feature for adding an Event to the Calendar
 * Version 1.2 - 05/21/2010 - 05/25/2010
 *   1. Minor Bug - Cleaned up category handling for Places when a Place has no categories
 *   2. Minor Enhancement - Changed support email method on help screen from button
 *      to group/row with an icon
 *   3. New Feature - Added ability to email a Place or Event to yourself or anyone
 * Version 1.1.2 - 05/11/2010
 *   1. Updated Place/Event list selector to display "Place" when popping back from
 *   events scene
 *   2. Removed unsolicited gps lookup; all gps lookups now user initiated
 *   3. Added help screen with options to send support email or visit the website
 * Version 1.1.1 - 05/08/2010
 *   1. Updated event name field
 * Version 1.1.0 - 05/02/2010 - 05/07/2010
 *   1. Added Event lookup
 *   2. Fixed search by zip sort set to Rating bug
 * Version 1.0.1 - 05/01/2010 - 05/02/2010
 *   1. updated queryResults-assistant.js - fixed showYQLErrorDialog
 *   to pop off queryResults when user clicks "Dismiss" or swipes back.
 *   2. updated queryInput-assistant.js - added a deactivate to the Search by GPS
 *   Button when a user gets a Location Error alert dialog
 *   3. moved all references of $("searchGPS").mojo.deactivate(); into the onChoose
 *   of the alert dialog
 *   4. fixed url for gps lookup when sorting by rating
 *   5. added rating to results list
 *   6. enabled free screen rotation
 *   7. fixed LastRevewDate display bug
 *   8. added Internet connection test, displays warning if no connection is available
 * Version 1.0.0 - initial beta release on 04/30/2010
 */
