// generation the mailto link that we use
// in the permission denied dialog
import mailtoLink from 'mailto-link';

const body = (
`Hi Learninfi Support Ninjas,
When I try to use your webapp I'm shown the permission denied error.
I tried a lot, but wasn't able to understand how I can grant access to my camera / microphone.
Can you please help me with that?

I am using the browser - <your browser name>
I tried the following - <if possible, please list what you tried so that we help you better>
<Enter any other details that you feel is relevant>

Thanks!
<Your name>`);

export default mailtoLink({
    to: 'contact@learninfi.com',
    subject: 'How do I enable camera / mic permission?',
    body
});
