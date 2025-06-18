using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DocManagementBackend.Data;
using DocManagementBackend.Models;
using DocManagementBackend.Mappings;
using DocManagementBackend.Services;
using System.Security.Claims;

namespace DocManagementBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class SousLignesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly UserAuthorizationService _authService;

        public SousLignesController(
            ApplicationDbContext context,
            UserAuthorizationService authService) 
        { 
            _context = context;
            _authService = authService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<SousLigne>>> GetSousLignes()
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var sousLigne = await _context.SousLignes
                .Include(s => s.Ligne!).ThenInclude(l => l.Document!).ThenInclude(d => d.DocumentType)
                .Include(s => s.Ligne!).ThenInclude(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Select(SousLigneMappings.ToSousLigneDto).ToListAsync();
            return Ok(sousLigne);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SousLigne>> GetSousLigne(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var sousLigne = await _context.SousLignes
                .Include(s => s.Ligne!).ThenInclude(l => l.Document!).ThenInclude(d => d.DocumentType)
                .Include(s => s.Ligne!).ThenInclude(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Select(SousLigneMappings.ToSousLigneDto).FirstOrDefaultAsync(s => s.Id == id);

            if (sousLigne == null)
                return NotFound("SousLigne not found.");

            return Ok(sousLigne);
        }

        [HttpGet("by_ligne/{id}")]
        public async Task<ActionResult<SousLigne>> GetSousLigneByLigneId(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var sousLigne = await _context.SousLignes
                .Where(s => s.LigneId == id)
                .Include(s => s.Ligne!).ThenInclude(l => l.Document!).ThenInclude(d => d.DocumentType)
                .Include(s => s.Ligne!).ThenInclude(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Select(SousLigneMappings.ToSousLigneDto).ToListAsync();
            if (sousLigne == null)
                return NotFound("No SousLigne found with that ligne.");
            return Ok(sousLigne);
        }

        [HttpGet("by_document/{id}")]
        public async Task<ActionResult<SousLigne>> GetSousLigneByDocId(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User);
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var sousLigne = await _context.SousLignes
                .Where(s => s.Ligne!.DocumentId == id)
                .Include(s => s.Ligne!).ThenInclude(l => l.Document!).ThenInclude(d => d.DocumentType)
                .Include(s => s.Ligne!).ThenInclude(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Select(SousLigneMappings.ToSousLigneDto).ToListAsync();
            if (sousLigne == null)
                return NotFound("No SousLigne found linked to document.");
            return Ok(sousLigne);
        }

        [HttpPost]
        public async Task<ActionResult<SousLigne>> CreateSousLigne([FromBody] SousLigne sousLigne)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var ligne = await _context.Lignes.FindAsync(sousLigne.LigneId);
            if (ligne == null)
                return BadRequest("Invalid LigneId. Ligne not found.");
                
            sousLigne.CreatedAt = DateTime.UtcNow;
            sousLigne.UpdatedAt = DateTime.UtcNow;
            sousLigne.SousLigneKey = $"{ligne.LigneKey}SL{ligne.SousLigneCounter++}";
            
            _context.SousLignes.Add(sousLigne);

            // Update document to track that a sous-ligne was added
            var document = await _context.Documents.FindAsync(ligne.DocumentId);
            if (document != null)
            {
                document.UpdatedAt = DateTime.UtcNow;
                document.UpdatedByUserId = authResult.UserId; // Track who added the sous-ligne
            }

            await _context.SaveChangesAsync();
            
            var sousLigneDto = await _context.SousLignes
                .Where(s => s.Id == sousLigne.Id)
                .Include(s => s.Ligne!).ThenInclude(l => l.Document!).ThenInclude(d => d.DocumentType)
                .Include(s => s.Ligne!).ThenInclude(l => l.Document!).ThenInclude(d => d.CreatedBy).ThenInclude(u => u.Role)
                .Select(SousLigneMappings.ToSousLigneDto).ToListAsync();
                
            return CreatedAtAction(nameof(GetSousLigne), new { id = sousLigne.Id }, sousLigneDto);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSousLigne(int id, [FromBody] SousLigne updatedSousLigne)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var sousLigne = await _context.SousLignes
                .Include(s => s.Ligne)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (sousLigne == null)
                return NotFound("SousLigne not found.");
                
            if (!string.IsNullOrEmpty(updatedSousLigne.Title))
                sousLigne.Title = updatedSousLigne.Title;
                
            if (!string.IsNullOrEmpty(updatedSousLigne.Attribute))
                sousLigne.Attribute = updatedSousLigne.Attribute;
                
            sousLigne.UpdatedAt = DateTime.UtcNow;

            // Update document to track that a sous-ligne was modified
            if (sousLigne.Ligne != null)
            {
                var document = await _context.Documents.FindAsync(sousLigne.Ligne.DocumentId);
                if (document != null)
                {
                    document.UpdatedAt = DateTime.UtcNow;
                    document.UpdatedByUserId = authResult.UserId; // Track who modified the sous-ligne
                }
            }

            await _context.SaveChangesAsync();
            
            return Ok("SousLigne updated!");
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSousLigne(int id)
        {
            var authResult = await _authService.AuthorizeUserAsync(User, new[] { "Admin", "FullUser" });
            if (!authResult.IsAuthorized)
                return authResult.ErrorResponse!;

            var sousLigne = await _context.SousLignes
                .Include(s => s.Ligne)
                .FirstOrDefaultAsync(s => s.Id == id);
            if (sousLigne == null)
                return NotFound("SousLigne not found.");
                
            _context.SousLignes.Remove(sousLigne);

            // Update document to track that a sous-ligne was deleted
            if (sousLigne.Ligne != null)
            {
                var document = await _context.Documents.FindAsync(sousLigne.Ligne.DocumentId);
                if (document != null)
                {
                    document.UpdatedAt = DateTime.UtcNow;
                    document.UpdatedByUserId = authResult.UserId; // Track who deleted the sous-ligne
                }
            }

            await _context.SaveChangesAsync();
            
            return Ok("SousLigne deleted!");
        }
    }
}
