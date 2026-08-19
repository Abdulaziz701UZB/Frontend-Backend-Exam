import { Certificate } from "../models/index.js";

export const createCertificate = async (req, res) => {
  try {
    const newCertData = {
      ...req.body,
      id: req.body.id || `CERT-${Math.floor(8000 + Math.random() * 999)}`,
      qr_code:
        req.body.qr_code ||
        `QR-${Math.floor(1000 + Math.random() * 9000)}-VERIFIED`,
    };
    const cert = await Certificate.create(newCertData);
    res.status(201).send(cert);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const getCertificates = async (req, res) => {
  try {
    const certs = await Certificate.findAll();
    res.status(200).send(certs);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const updateCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findByPk(req.params.id);
    if (!cert) return res.status(404).send("Certificate not found");

    await cert.update(req.body);
    res.status(200).send(cert);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findByPk(req.params.id);
    if (!cert) return res.status(404).send("Certificate not found");

    const certData = cert.toJSON();
    await cert.destroy();
    res.status(200).send(certData);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
