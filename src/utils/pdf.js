export const downloadEtkinlikPDF = (base) => {
  const link = document.createElement('a');
  link.href = `${base}etkinlik-kitapcigi.pdf`;
  link.download = 'Etkinlik_Kitapcigi_KagitKalem.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
