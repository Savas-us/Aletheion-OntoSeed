pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/sha256/sha256.circom";
include "../node_modules/circomlib/circuits/bitify.circom";

template ProvHash() {
    // Input signals
    signal input subject;     // Subject as field element
    signal input object;      // Object as field element  
    signal input timestamp;   // Timestamp as number
    
    // Output signal
    signal output hash;
    
    // Components
    component sha256 = Sha256(256);
    component n2b_subj = Num2Bits(64);
    component n2b_obj = Num2Bits(64);
    component n2b_ts = Num2Bits(64);
    component b2n = Bits2Num(64);
    
    // Convert inputs to bits
    n2b_subj.in <== subject;
    n2b_obj.in <== object;
    n2b_ts.in <== timestamp;
    
    // Concatenate inputs for hashing (simplified)
    for (var i = 0; i < 64; i++) {
        sha256.in[i] <== n2b_subj.out[i];
        sha256.in[64 + i] <== n2b_obj.out[i];
        sha256.in[128 + i] <== n2b_ts.out[i];
    }
    
    // Fill remaining bits with zeros
    for (var i = 192; i < 256; i++) {
        sha256.in[i] <== 0;
    }
    
    // Extract first 64 bits of hash as output
    for (var i = 0; i < 64; i++) {
        b2n.in[i] <== sha256.out[i];
    }
    
    hash <== b2n.out;
}

component main = ProvHash();