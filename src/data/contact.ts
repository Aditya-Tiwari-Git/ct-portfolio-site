export const contact = {
  address: 'Sector 144, Noida, Uttar Pradesh 201307, India',
  phones: ['+91-8447844097', '+91-8287204638'],
  phoneLinks: ['+918447844097', '+918287204638'],
  whatsapp: 'https://wa.me/918447844097',
};
export function whatsappLink(message = 'Hello Consultix Technologies, I would like to discuss a technology project.') {
  return `${contact.whatsapp}?text=${encodeURIComponent(message)}`;
}
