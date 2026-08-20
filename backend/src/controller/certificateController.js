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
    res.status(201).json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCertificates = async (req, res) => {
  try {
    const certs = await Certificate.findAll({ order: [["issue_date", "DESC"]] });
    res.status(200).json(certs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCertificateById = async (req, res) => {
  try {
    const cert = await Certificate.findByPk(req.params.id);
    if (!cert) return res.status(404).json({ error: "Sertifikat topilmadi" });
    res.status(200).json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findOne({ where: { qr_code: req.params.qr_code } });
    if (!cert) return res.status(404).json({ error: "Sertifikat haqiqiy emas yoki topilmadi" });
    res.status(200).json({ valid: true, certificate: cert });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findByPk(req.params.id);
    if (!cert) return res.status(404).json({ error: "Sertifikat topilmadi" });

    await cert.update(req.body);
    res.status(200).json(cert);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findByPk(req.params.id);
    if (!cert) return res.status(404).json({ error: "Sertifikat topilmadi" });

    await cert.destroy();
    res.status(200).json({ message: "Sertifikat o'chirildi" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
