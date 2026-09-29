document.addEventListener("DOMContentLoaded", function () {
    const login = document.getElementById("loginForm");
    if (login) {
        login.addEventListener("submit", function (e) {
            e.preventDefault();
            const role = document.getElementById("role").value;
            window.location.href = (role === "admin") ? "dashboard-admin.html" : "dashboard-user.html";
        });
    }

    const search = document.getElementById("searchForm");
    if (search) {
        search.addEventListener("submit", function (e) {
            e.preventDefault();
            window.location.href = "katalog.html";
        });
    }

    // ============================
    // SIDEBAR TOGGLE + BACKDROP
    // (Tutup hanya saat klik di luar sidebar)
    // ============================
    const menu = document.getElementById("mobileMenu");
    const sidebar = document.getElementById("sidebar");

    if (menu && sidebar) {
        // Buat backdrop otomatis kalau belum ada
        let backdrop = document.getElementById("sidebarBackdrop");
        if (!backdrop) {
            backdrop = document.createElement("div");
            backdrop.id = "sidebarBackdrop";
            backdrop.className = "sidebar-backdrop";
            document.body.appendChild(backdrop);
        }

        function openSidebar() {
            sidebar.classList.add("show");
            backdrop.classList.add("show");
            document.body.style.overflow = "hidden";
        }

        function closeSidebar() {
            sidebar.classList.remove("show");
            backdrop.classList.remove("show");
            document.body.style.overflow = "";
        }

        function toggleSidebar() {
            sidebar.classList.contains("show") ? closeSidebar() : openSidebar();
        }

        // Tombol hamburger → buka/tutup
        menu.addEventListener("click", function (e) {
            e.stopPropagation();
            toggleSidebar();
        });

        // Klik backdrop (di luar sidebar) → tutup
        backdrop.addEventListener("click", closeSidebar);

        // Klik link di dalam sidebar → auto close (mobile)
        sidebar.querySelectorAll(".nav-link, a").forEach(function (link) {
            link.addEventListener("click", function () {
                if (window.innerWidth < 992) closeSidebar();
            });
        });

        // ESC → tutup
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape" && sidebar.classList.contains("show")) closeSidebar();
        });

        // Resize ke desktop → reset
        window.addEventListener("resize", function () {
            if (window.innerWidth >= 992) closeSidebar();
        });
    }

    const logout = document.querySelectorAll(".logout");
    logout.forEach(function (button) {
        button.addEventListener("click", function () {
            window.location.href = "login.html";
        });
    });
});

let bukuTerpilih = "";
function cariBuku() {
    const keyword = document.getElementById("searchInput").value.toLowerCase().trim();
    const books = document.querySelectorAll(".book-item");
    let jumlah = 0;
    books.forEach(b => {
        const data = b.getAttribute("data-search").toLowerCase();
        if (data.includes(keyword)) { b.classList.remove("d-none"); jumlah++; } else { b.classList.add("d-none"); }
    });
    updateJumlah(jumlah);
    document.getElementById("tidakDitemukan").classList.toggle("d-none", jumlah !== 0);
}

function filterKategori(kategori, btn) {
    document.querySelectorAll(".category-btn").forEach(x => x.classList.remove("active"));
    btn.classList.add("active");
    const books = document.querySelectorAll(".book-item");
    let jumlah = 0;
    books.forEach(b => {
        const kat = b.getAttribute("data-kategori");
        if (kategori === "Semua" || kat === kategori) { b.classList.remove("d-none"); jumlah++; } else { b.classList.add("d-none"); }
    });
    document.getElementById("searchInput").value = "";
    updateJumlah(jumlah);
    document.getElementById("tidakDitemukan").classList.toggle("d-none", jumlah !== 0);
}

function updateJumlah(j) { document.getElementById("jumlahBuku").textContent = j + " Buku"; }

function showToast(judul, customMessage) {
    const msgEl = document.getElementById("toastMsg");
    msgEl.textContent = customMessage
        ? customMessage
        : `Buku "${judul}" dipilih untuk dipinjam.`;

    const el = document.getElementById("toastPinjam");
    const t = new bootstrap.Toast(el, { delay: 3000 });
    t.show();
}


function pinjamBuku(judul) { showToast(judul); }

function pinjamDariModal() {
    const modalEl = document.getElementById("modalDetail");
    const m = bootstrap.Modal.getInstance(modalEl);
    if (m) m.hide();
    showToast(bukuTerpilih);
}

function tambahKeRak(judul) {
    showToast(judul, `Buku "${judul}" berhasil ditambahkan ke rak buku!`);
}

const searchInputEl = document.getElementById("searchInput");
if (searchInputEl) {
    searchInputEl.addEventListener("keypress", e => { if (e.key === "Enter") cariBuku(); });
}

function sortBuku() {
    const grid = document.getElementById("bookGrid");
    if (!grid) return;
    const items = Array.from(document.querySelectorAll(".book-item"));
    const mode = document.getElementById("sortSelect").value;
    items.sort((a, b) => {
        if (mode === "az") return a.dataset.judul.localeCompare(b.dataset.judul);
        if (mode === "rating") return parseFloat(b.dataset.rating) - parseFloat(a.dataset.rating);
        return 0;
    });
    items.forEach(i => grid.appendChild(i));
}

/* ============================================================
   FITUR TAMBAHAN
   - Kelola Buku (dashboard admin)
   - Rak Saya (dashboard user)
   File ini terpisah dari script.js agar script.js tidak berubah.
   ============================================================ */

/* ================= KELOLA BUKU (ADMIN) ================= */

function tampilkanToastAdmin(pesan) {
    const el = document.getElementById("toastAdmin");
    if (!el) return;
    document.getElementById("toastAdminMsg").textContent = pesan;
    new bootstrap.Toast(el, { delay: 2500 }).show();
}

function bukaModalTambah() {
    document.getElementById("modalBukuTitle").textContent = "Tambah Buku";
    document.getElementById("formBuku").reset();
    document.getElementById("bukuBarisAktif").value = "";
    document.getElementById("inputStok").value = 1;
    document.querySelectorAll('tr[data-editing="true"]').forEach(r => r.removeAttribute("data-editing")); // BARU
}

document.addEventListener("hidden.bs.modal", function (e) {
    if (e.target.id === "modalBuku") {
        document.querySelectorAll('tr[data-editing="true"]').forEach(r => r.removeAttribute("data-editing"));
    }
});

function editBuku(tombol) {
    const baris = tombol.closest("tr");
    document.getElementById("modalBukuTitle").textContent = "Edit Buku";
    document.getElementById("bukuBarisAktif").value = baris.rowIndex;
    document.getElementById("inputJudul").value = baris.querySelector(".kolom-judul").textContent.trim();
    document.getElementById("inputPenulis").value = baris.querySelector(".kolom-penulis").textContent.trim();
    document.getElementById("inputKategori").value = baris.querySelector(".kolom-kategori").textContent.trim();
    document.getElementById("inputStok").value = baris.querySelector(".kolom-stok").textContent.trim();

    baris.dataset.editing = "true";
    new bootstrap.Modal(document.getElementById("modalBuku")).show();
}

function simpanBuku(e) {
    e.preventDefault();

    const judul = document.getElementById("inputJudul").value.trim();
    const penulis = document.getElementById("inputPenulis").value.trim();
    const kategori = document.getElementById("inputKategori").value;
    const stok = parseInt(document.getElementById("inputStok").value, 10) || 0;
    const statusBadge = stok > 0
        ? '<span class="badge bg-success-subtle text-success">Tersedia</span>'
        : '<span class="badge bg-danger-subtle text-danger">Habis</span>';

    const tbody = document.getElementById("tabelBukuAdmin");
    const barisSedangDiedit = tbody.querySelector('tr[data-editing="true"]');

    if (barisSedangDiedit) {
        // Update baris yang sedang diedit
        barisSedangDiedit.querySelector(".kolom-judul").innerHTML = `<b>${judul}</b>`;
        barisSedangDiedit.querySelector(".kolom-penulis").textContent = penulis;
        barisSedangDiedit.querySelector(".kolom-kategori").textContent = kategori;
        barisSedangDiedit.querySelector(".kolom-stok").textContent = stok;
        barisSedangDiedit.querySelector(".kolom-status").innerHTML = statusBadge;
        barisSedangDiedit.dataset.judul = judul;
        barisSedangDiedit.dataset.penulis = penulis;
        barisSedangDiedit.dataset.kategori = kategori;
        barisSedangDiedit.dataset.kategori = kategori;
        barisSedangDiedit.dataset.stok = stok;   // BARU
        barisSedangDiedit.removeAttribute("data-editing");
        tampilkanToastAdmin(`Buku "${judul}" berhasil diperbarui.`);
    } else {
        // Tambah baris baru
        const barisBaru = document.createElement("tr");
        barisBaru.className = "baris-buku";
        barisBaru.dataset.judul = judul;
        barisBaru.dataset.penulis = penulis;
        barisBaru.dataset.kategori = kategori;
        barisBaru.dataset.stok = stok;
        barisBaru.innerHTML = `
            <td class="kolom-judul"><b>${judul}</b></td>
            <td class="kolom-penulis">${penulis}</td>
            <td class="kolom-kategori">${kategori}</td>
            <td class="kolom-stok">${stok}</td>
            <td class="kolom-status">${statusBadge}</td>
            <td>
                <button class="btn btn-sm btn-light" onclick="editBuku(this)"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-light text-danger" onclick="hapusBuku(this)"><i class="bi bi-trash"></i></button>
            </td>`;
        tbody.appendChild(barisBaru);
        tampilkanToastAdmin(`Buku "${judul}" berhasil ditambahkan.`);
    }

    updateJumlahBukuAdmin();
    bootstrap.Modal.getInstance(document.getElementById("modalBuku")).hide();
}

function hapusBuku(tombol) {
    const baris = tombol.closest("tr");
    const judul = baris.dataset.judul;
    if (confirm(`Hapus buku "${judul}" dari daftar?`)) {
        baris.remove();
        updateJumlahBukuAdmin();
        tampilkanToastAdmin(`Buku "${judul}" berhasil dihapus.`);
    }
}

function cariBukuAdmin() {
    const keyword = document.getElementById("cariBukuAdmin").value.toLowerCase().trim();
    const baris = document.querySelectorAll(".baris-buku");
    let jumlah = 0;
    baris.forEach(b => {
        const cocok = b.dataset.judul.toLowerCase().includes(keyword) ||
            b.dataset.penulis.toLowerCase().includes(keyword);
        b.classList.toggle("d-none", !cocok);
        if (cocok) jumlah++;
    });
    document.getElementById("jumlahBukuAdmin").textContent = jumlah + " Buku";
    document.getElementById("tabelBukuKosong").classList.toggle("d-none", jumlah !== 0);
}

function updateJumlahBukuAdmin() {
    const jumlah = document.querySelectorAll(".baris-buku").length;
    const el = document.getElementById("jumlahBukuAdmin");
    if (el) el.textContent = jumlah + " Buku";
    simpanKeStorage();
}

/* ================= RAK SAYA (USER) ================= */

function hapusDariRak(tombol, judul) {
    if (!confirm(`Hapus "${judul}" dari Rak Saya?`)) return;
    const kartu = tombol.closest(".buku-rak");
    kartu.remove();
    updateJumlahRak();

    const el = document.getElementById("toastRak");
    document.getElementById("toastRakMsg").textContent = `Buku "${judul}" dihapus dari rak.`;
    new bootstrap.Toast(el, { delay: 2500 }).show();
}

function updateJumlahRak() {
    const sisa = document.querySelectorAll(".buku-rak").length;
    const label = document.getElementById("jumlahRak");
    if (label) label.textContent = sisa + " Buku";
    const kosong = document.getElementById("rakKosong");
    if (kosong) kosong.classList.toggle("d-none", sisa !== 0);
}

/* ===== PENYIMPANAN KELOLA BUKU (localStorage) ===== */
const KUNCI_BUKU = "pustaka_buku";

function simpanKeStorage() {
    const tbody = document.getElementById("tabelBukuAdmin");
    if (!tbody) return;
    const data = Array.from(tbody.querySelectorAll(".baris-buku")).map(function (b) {
        return {
            judul: b.querySelector(".kolom-judul").textContent.trim(),
            penulis: b.querySelector(".kolom-penulis").textContent.trim(),
            kategori: b.querySelector(".kolom-kategori").textContent.trim(),
            stok: parseInt(b.querySelector(".kolom-stok").textContent, 10) || 0
        };
    });
    localStorage.setItem(KUNCI_BUKU, JSON.stringify(data));
}

function buatBarisBuku(b) {
    const tr = document.createElement("tr");
    tr.className = "baris-buku";
    tr.dataset.judul = b.judul;
    tr.dataset.penulis = b.penulis;
    tr.dataset.kategori = b.kategori;
    tr.dataset.stok = b.stok;
    const status = b.stok > 0
        ? '<span class="badge bg-success-subtle text-success">Tersedia</span>'
        : '<span class="badge bg-danger-subtle text-danger">Habis</span>';
    tr.innerHTML = `
        <td class="kolom-judul"><b></b></td>
        <td class="kolom-penulis"></td>
        <td class="kolom-kategori"></td>
        <td class="kolom-stok"></td>
        <td class="kolom-status">${status}</td>
        <td>
            <button class="btn btn-sm btn-light" onclick="editBuku(this)"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-light text-danger" onclick="hapusBuku(this)"><i class="bi bi-trash"></i></button>
        </td>`;
    tr.querySelector(".kolom-judul b").textContent = b.judul;
    tr.querySelector(".kolom-penulis").textContent = b.penulis;
    tr.querySelector(".kolom-kategori").textContent = b.kategori;
    tr.querySelector(".kolom-stok").textContent = b.stok;
    return tr;
}

document.addEventListener("DOMContentLoaded", function () {
    const tbody = document.getElementById("tabelBukuAdmin");
    if (!tbody) return;
    const tersimpan = localStorage.getItem(KUNCI_BUKU);
    if (!tersimpan) return;
    try {
        const data = JSON.parse(tersimpan);
        tbody.innerHTML = "";
        data.forEach(function (b) { tbody.appendChild(buatBarisBuku(b)); });
        updateJumlahBukuAdmin();
    } catch (err) {
        console.error("Data buku rusak:", err);
    }
});